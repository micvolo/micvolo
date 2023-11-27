import { defineCollection, z } from "astro:content";

const projects = defineCollection({
    schema: ({ image }) => z.object({
        title: z.string(),
        year: z.date(),
        url: z.string(),
        tags: z.string(),
        img: image().refine((img) => img.width >= 720, {
            message: "Cover image must be at least 720 pixels wide!",
        }),
    }),
});

export const collections = {
    projects
};