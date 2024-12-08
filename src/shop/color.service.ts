import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import * as assert from "assert";
// @ts-expect-error - no typings for this package
import { diff } from "color-diff";
// @ts-expect-error - no typings for this package
import { fromString } from "css-color-converter";
import { Model } from "mongoose";

import { AttributesEnum } from "@/shop-shared/constants/attributesEnum";
import {
	ItemAttribute,
	ItemAttributeDocument,
} from "@/shop-shared-server/schema/itemAttribute.schema";

type TRGBObject<Color extends string> = Readonly<{ R: number; G: number; B: number; name: Color }>;

type TRGBObjectWithDIff<Color extends string> = TRGBObject<Color> & { diff: number };

const colorStringToRgbObject = <const Color extends string>(color: Color) => {
	const knownColor = fromString(color);
	if (!knownColor) {
		throw new Error(`Unknown color ${color}`);
	}
	const [R, G, B] = knownColor.toRgbaArray();
	return { R, G, B, name: color } as const satisfies TRGBObject<typeof color>;
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
function sortAndMap<const Color extends string, const TObject extends TRGBObjectWithDIff<Color>>(
	tObjects: TObject[],
) {
	return tObjects.sort((a, b) => a.diff - b.diff).map((color) => color.name);
}

const SimilarityThreshold = 30;

@Injectable()
export default class ColorService implements OnModuleInit {
	private logger: Logger = new Logger(ColorService.name);
	private readonly colorsList: string[] = [];
	private readonly colorsRgbaList: TRGBObject<string>[] = [];

	constructor(
		@InjectModel(ItemAttribute.name)
		private itemAttributeModel: Model<ItemAttributeDocument>,
	) {}

	async onModuleInit(): Promise<void> {
		const [colorAttributes] = await this.itemAttributeModel
			.find({ key: AttributesEnum.COLOR })
			.exec();
		assert.ok(colorAttributes, "Color attributes not found");

		this.colorsList.push(
			...colorAttributes.values
				.map((v) => v.key)
				.filter((value) => !["multicolor", "transparent"].includes(value)),
		);

		this.colorsRgbaList.push(...this.colorsList.map((color) => colorStringToRgbObject(color)));
	}

	getNearestColors<const Color extends string>(sourceColors: Color[]): string[] {
		const nearestColorsDiffs = sourceColors.map((color) =>
			this.getNearestColorsDiffs(color, SimilarityThreshold),
		);
		const allDiffs = nearestColorsDiffs.flat();
		return sortAndMap(allDiffs);
	}

	private getNearestColorsDiffs<const Color extends string>(
		sourceColor: Color,
		similarityThreshold: number,
	): TRGBObjectWithDIff<Color>[] {
		const sourceColorRgba = colorStringToRgbObject(sourceColor);

		return this.colorsRgbaList
			.map((color) => ({
				...color,
				diff: diff(sourceColorRgba, color),
			}))
			.filter((color) => color.diff < similarityThreshold) as TRGBObjectWithDIff<Color>[];
	}
}
