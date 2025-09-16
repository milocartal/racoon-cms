"use client";

import { useForm } from "react-hook-form";
import type z from "zod";
import { mediaSchema } from "~/lib/models/Media";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "~/app/_components/ui/button";
import {
  Fieldset,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/app/_components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/app/_components/ui/select";
import { Input } from "~/app/_components/ui/input";

import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { MediaKind } from "@prisma/client";

export const CreateMedia: React.FC = () => {
  const router = useRouter();

  const createMedia = api.media.create.useMutation({
    onSuccess: () => {
      toast.dismiss();
      form.reset();
      toast.success("Media created successfully!");
      router.push("/media");
    },
    onError: (error) => {
      toast.dismiss();
      console.error("Error creating media:", error);
      toast.error("Failed to create media.");
    },
    onMutate: () => {
      toast.loading("Creating media...");
    },
  });

  const form = useForm<z.infer<typeof mediaSchema>>({
    resolver: zodResolver(mediaSchema),
  });

  async function onSubmit(values: z.infer<typeof mediaSchema>) {
    await createMedia.mutateAsync(values);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex w-full flex-col items-start gap-4"
      >
        <Fieldset>
          <FormField
            control={form.control}
            name="kind"
            render={({ field }) => (
              <FormItem className="w-full lg:w-1/2">
                <FormLabel>
                  Type <span className="text-red-500">*</span>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sélectionnez un rôle" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(MediaKind).map(([key, value]) => (
                      <SelectItem key={key} value={key}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="alt"
            render={({ field }) => (
              <FormItem className="w-full lg:w-1/2">
                <FormLabel>Texte alternatif</FormLabel>
                <FormControl>
                  <Input placeholder="Champs de fleurs ..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Fieldset>
      </form>
    </Form>
  );
};
