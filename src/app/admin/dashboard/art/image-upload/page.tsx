'use client'

import { get, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Dropzone from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { imageSchema, ImageSchemaType } from "@/types/schemas";
import { addImageToDb } from "@/actions/db-images-actions";
import axios from 'axios'
import { getSignedUploadUrl } from "@/actions/r2-actions";
import { useRouter } from "next/navigation";

export default function page() {
    const router = useRouter();
    const form = useForm<ImageSchemaType>({
        resolver: zodResolver(imageSchema),
        defaultValues: {
            name: "",
            caption: "",
        }
    });



    async function onSubmit(values: ImageSchemaType) {
        try {
            const url = await getSignedUploadUrl(values.file.name)
            if (url.success) {
                const result = await axios.put(url.data.url, values.file, {
                    headers: {
                        "Content-Type": values.file.type
                    }
                });
                if (result.status === 200) {
                    addImageToDb({
                        name: values.name,
                        caption: values.caption,
                        imageKey: url.data.uniqueKey
                    })
                }
                router.push('/admin/dashboard/art')
            }

        } catch (error) {
            console.error('Upload failed:', error);
        }
    };

    return (
        <div className="h-full">
            <div className="h-full w-full flex flex-col items-center gap-y-5">
                <h1 className="text-4xl">upload new image</h1>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="w-1/2 space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input placeholder="name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="caption"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input placeholder="caption" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="file"
                            render={({ field: { onChange, value } }) => (
                                <FormItem>
                                    <FormControl>
                                        <Dropzone
                                            onDrop={acceptedFiles => {
                                                onChange(acceptedFiles[0]);
                                            }}
                                        >
                                            {({ getRootProps, getInputProps }) => (
                                                <div className="w-full h-32 flex justify-center items-center border border-gray-400 bg-gray-700 text-foreground cursor-pointer rounded-lg" {...getRootProps()}>
                                                    <input {...getInputProps()} />
                                                    {value ? (
                                                        <p className="text-sm">{value.name}</p>
                                                    ) : (
                                                        <p>drop file or click for dialog</p>
                                                    )}
                                                </div>
                                            )}
                                        </Dropzone>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={!form.formState.isValid}
                        >
                            upload image
                        </Button>
                    </form>
                </Form>
            </div>
        </div>

    );
}
