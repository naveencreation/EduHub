import { z } from "zod";
export declare const createTopicSchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodString;
        slug: z.ZodOptional<z.ZodString>;
        description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        thumbnailUrl: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        sortOrder: z.ZodDefault<z.ZodNumber>;
        isPublished: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        sortOrder: number;
        isPublished: boolean;
        slug?: string | undefined;
        description?: string | null | undefined;
        thumbnailUrl?: string | null | undefined;
    }, {
        name: string;
        slug?: string | undefined;
        description?: string | null | undefined;
        thumbnailUrl?: string | null | undefined;
        sortOrder?: number | undefined;
        isPublished?: boolean | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        name: string;
        sortOrder: number;
        isPublished: boolean;
        slug?: string | undefined;
        description?: string | null | undefined;
        thumbnailUrl?: string | null | undefined;
    };
}, {
    body: {
        name: string;
        slug?: string | undefined;
        description?: string | null | undefined;
        thumbnailUrl?: string | null | undefined;
        sortOrder?: number | undefined;
        isPublished?: boolean | undefined;
    };
}>;
export declare const updateTopicSchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        slug: z.ZodOptional<z.ZodString>;
        description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        thumbnailUrl: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        sortOrder: z.ZodOptional<z.ZodNumber>;
        isPublished: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        name?: string | undefined;
        slug?: string | undefined;
        description?: string | null | undefined;
        thumbnailUrl?: string | null | undefined;
        sortOrder?: number | undefined;
        isPublished?: boolean | undefined;
    }, {
        name?: string | undefined;
        slug?: string | undefined;
        description?: string | null | undefined;
        thumbnailUrl?: string | null | undefined;
        sortOrder?: number | undefined;
        isPublished?: boolean | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        name?: string | undefined;
        slug?: string | undefined;
        description?: string | null | undefined;
        thumbnailUrl?: string | null | undefined;
        sortOrder?: number | undefined;
        isPublished?: boolean | undefined;
    };
}, {
    body: {
        name?: string | undefined;
        slug?: string | undefined;
        description?: string | null | undefined;
        thumbnailUrl?: string | null | undefined;
        sortOrder?: number | undefined;
        isPublished?: boolean | undefined;
    };
}>;
export declare const reorderTopicsSchema: z.ZodObject<{
    body: z.ZodObject<{
        topicIds: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        topicIds: string[];
    }, {
        topicIds: string[];
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        topicIds: string[];
    };
}, {
    body: {
        topicIds: string[];
    };
}>;
//# sourceMappingURL=topic.schema.d.ts.map