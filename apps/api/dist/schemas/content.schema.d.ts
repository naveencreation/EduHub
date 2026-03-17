import { z } from "zod";
export declare const createContentSchema: z.ZodObject<{
    body: z.ZodObject<{
        topicId: z.ZodString;
        courseId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        title: z.ZodString;
        slug: z.ZodOptional<z.ZodString>;
        type: z.ZodEnum<["VIDEO", "AUDIO", "IMAGE", "BLOG"]>;
        description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        body: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        fileUrl: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        streamId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        thumbnailUrl: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        durationSecs: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
        sortOrder: z.ZodDefault<z.ZodNumber>;
        isPublished: z.ZodDefault<z.ZodBoolean>;
        tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        type: "VIDEO" | "AUDIO" | "IMAGE" | "BLOG";
        sortOrder: number;
        isPublished: boolean;
        topicId: string;
        title: string;
        tags?: string[] | undefined;
        body?: string | null | undefined;
        slug?: string | undefined;
        description?: string | null | undefined;
        thumbnailUrl?: string | null | undefined;
        courseId?: string | null | undefined;
        fileUrl?: string | null | undefined;
        streamId?: string | null | undefined;
        durationSecs?: number | null | undefined;
    }, {
        type: "VIDEO" | "AUDIO" | "IMAGE" | "BLOG";
        topicId: string;
        title: string;
        tags?: string[] | undefined;
        body?: string | null | undefined;
        slug?: string | undefined;
        description?: string | null | undefined;
        thumbnailUrl?: string | null | undefined;
        sortOrder?: number | undefined;
        isPublished?: boolean | undefined;
        courseId?: string | null | undefined;
        fileUrl?: string | null | undefined;
        streamId?: string | null | undefined;
        durationSecs?: number | null | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        type: "VIDEO" | "AUDIO" | "IMAGE" | "BLOG";
        sortOrder: number;
        isPublished: boolean;
        topicId: string;
        title: string;
        tags?: string[] | undefined;
        body?: string | null | undefined;
        slug?: string | undefined;
        description?: string | null | undefined;
        thumbnailUrl?: string | null | undefined;
        courseId?: string | null | undefined;
        fileUrl?: string | null | undefined;
        streamId?: string | null | undefined;
        durationSecs?: number | null | undefined;
    };
}, {
    body: {
        type: "VIDEO" | "AUDIO" | "IMAGE" | "BLOG";
        topicId: string;
        title: string;
        tags?: string[] | undefined;
        body?: string | null | undefined;
        slug?: string | undefined;
        description?: string | null | undefined;
        thumbnailUrl?: string | null | undefined;
        sortOrder?: number | undefined;
        isPublished?: boolean | undefined;
        courseId?: string | null | undefined;
        fileUrl?: string | null | undefined;
        streamId?: string | null | undefined;
        durationSecs?: number | null | undefined;
    };
}>;
export declare const updateContentSchema: z.ZodObject<{
    body: z.ZodObject<{
        topicId: z.ZodOptional<z.ZodString>;
        courseId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        title: z.ZodOptional<z.ZodString>;
        slug: z.ZodOptional<z.ZodString>;
        description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        body: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        fileUrl: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        streamId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        thumbnailUrl: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        durationSecs: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
        sortOrder: z.ZodOptional<z.ZodNumber>;
        isPublished: z.ZodOptional<z.ZodBoolean>;
        tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        tags?: string[] | undefined;
        body?: string | null | undefined;
        slug?: string | undefined;
        description?: string | null | undefined;
        thumbnailUrl?: string | null | undefined;
        sortOrder?: number | undefined;
        isPublished?: boolean | undefined;
        topicId?: string | undefined;
        title?: string | undefined;
        courseId?: string | null | undefined;
        fileUrl?: string | null | undefined;
        streamId?: string | null | undefined;
        durationSecs?: number | null | undefined;
    }, {
        tags?: string[] | undefined;
        body?: string | null | undefined;
        slug?: string | undefined;
        description?: string | null | undefined;
        thumbnailUrl?: string | null | undefined;
        sortOrder?: number | undefined;
        isPublished?: boolean | undefined;
        topicId?: string | undefined;
        title?: string | undefined;
        courseId?: string | null | undefined;
        fileUrl?: string | null | undefined;
        streamId?: string | null | undefined;
        durationSecs?: number | null | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        tags?: string[] | undefined;
        body?: string | null | undefined;
        slug?: string | undefined;
        description?: string | null | undefined;
        thumbnailUrl?: string | null | undefined;
        sortOrder?: number | undefined;
        isPublished?: boolean | undefined;
        topicId?: string | undefined;
        title?: string | undefined;
        courseId?: string | null | undefined;
        fileUrl?: string | null | undefined;
        streamId?: string | null | undefined;
        durationSecs?: number | null | undefined;
    };
}, {
    body: {
        tags?: string[] | undefined;
        body?: string | null | undefined;
        slug?: string | undefined;
        description?: string | null | undefined;
        thumbnailUrl?: string | null | undefined;
        sortOrder?: number | undefined;
        isPublished?: boolean | undefined;
        topicId?: string | undefined;
        title?: string | undefined;
        courseId?: string | null | undefined;
        fileUrl?: string | null | undefined;
        streamId?: string | null | undefined;
        durationSecs?: number | null | undefined;
    };
}>;
export declare const reorderContentSchema: z.ZodObject<{
    body: z.ZodObject<{
        contentIds: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        contentIds: string[];
    }, {
        contentIds: string[];
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        contentIds: string[];
    };
}, {
    body: {
        contentIds: string[];
    };
}>;
//# sourceMappingURL=content.schema.d.ts.map