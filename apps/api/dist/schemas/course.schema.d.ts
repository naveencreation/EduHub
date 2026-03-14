import { z } from "zod";
export declare const createCourseSchema: z.ZodObject<{
    body: z.ZodObject<{
        topicId: z.ZodString;
        title: z.ZodString;
        slug: z.ZodOptional<z.ZodString>;
        description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        thumbnailUrl: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        sortOrder: z.ZodDefault<z.ZodNumber>;
        isPublished: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        sortOrder: number;
        isPublished: boolean;
        topicId: string;
        title: string;
        slug?: string | undefined;
        description?: string | null | undefined;
        thumbnailUrl?: string | null | undefined;
    }, {
        topicId: string;
        title: string;
        slug?: string | undefined;
        description?: string | null | undefined;
        thumbnailUrl?: string | null | undefined;
        sortOrder?: number | undefined;
        isPublished?: boolean | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        sortOrder: number;
        isPublished: boolean;
        topicId: string;
        title: string;
        slug?: string | undefined;
        description?: string | null | undefined;
        thumbnailUrl?: string | null | undefined;
    };
}, {
    body: {
        topicId: string;
        title: string;
        slug?: string | undefined;
        description?: string | null | undefined;
        thumbnailUrl?: string | null | undefined;
        sortOrder?: number | undefined;
        isPublished?: boolean | undefined;
    };
}>;
export declare const updateCourseSchema: z.ZodObject<{
    body: z.ZodObject<{
        topicId: z.ZodOptional<z.ZodString>;
        title: z.ZodOptional<z.ZodString>;
        slug: z.ZodOptional<z.ZodString>;
        description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        thumbnailUrl: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        sortOrder: z.ZodOptional<z.ZodNumber>;
        isPublished: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        slug?: string | undefined;
        description?: string | null | undefined;
        thumbnailUrl?: string | null | undefined;
        sortOrder?: number | undefined;
        isPublished?: boolean | undefined;
        topicId?: string | undefined;
        title?: string | undefined;
    }, {
        slug?: string | undefined;
        description?: string | null | undefined;
        thumbnailUrl?: string | null | undefined;
        sortOrder?: number | undefined;
        isPublished?: boolean | undefined;
        topicId?: string | undefined;
        title?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        slug?: string | undefined;
        description?: string | null | undefined;
        thumbnailUrl?: string | null | undefined;
        sortOrder?: number | undefined;
        isPublished?: boolean | undefined;
        topicId?: string | undefined;
        title?: string | undefined;
    };
}, {
    body: {
        slug?: string | undefined;
        description?: string | null | undefined;
        thumbnailUrl?: string | null | undefined;
        sortOrder?: number | undefined;
        isPublished?: boolean | undefined;
        topicId?: string | undefined;
        title?: string | undefined;
    };
}>;
export declare const reorderCoursesSchema: z.ZodObject<{
    body: z.ZodObject<{
        courseIds: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        courseIds: string[];
    }, {
        courseIds: string[];
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        courseIds: string[];
    };
}, {
    body: {
        courseIds: string[];
    };
}>;
//# sourceMappingURL=course.schema.d.ts.map