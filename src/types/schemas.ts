import z from "zod";

export const imageSchema = z.object({
    name: z.string().min(1, "enter name"),
    caption: z.string().min(1, "enter caption"),
    file: z.instanceof(File, { message: "specify image file" })
});

export type ImageSchemaType = z.infer<typeof imageSchema>
