// // components/brands/BrandForm.tsx
// "use client";

// import { useForm } from "react-hook-form";
// import { Button } from "../ui/button";
// import { Input } from "../ui/input";
// import { Textarea } from "../ui/textarea";
// import { useTranslations } from "next-intl";
// import { brandService } from "@/services/brandService";
// import { useRouter } from "next/navigation";
// import { useState } from "react";
// import { toast } from "sonner";
// import { ImageUpload } from "../ui/image-upload";

// type FormData = {
//   name: string;
//   description: string;
//   logo?: File;
// };

// export function BrandForm() {
//   const t = useTranslations("Brand");
//   const router = useRouter();
//   const [isLoading, setIsLoading] = useState(false);
//   const {
//     register,
//     handleSubmit,
//     setValue,
//     formState: { errors },
//   } = useForm<FormData>();

//   const onSubmit = async (data: FormData) => {
//     try {
//       setIsLoading(true);
//       const brand = await brandService.createBrand(data);
//       toast.success(t("createSuccess"));
//       router.push(`/brands/${brand.id}`);
//     } catch (error) {
//       toast.error(t("createError"));
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
//       <div>
//         <label className="mb-2 block font-medium">{t("name")}</label>
//         <Input
//           {...register("name", { required: t("nameRequired") })}
//           placeholder={t("namePlaceholder")}
//         />
//         {errors.name && (
//           <p className="mt-1 text-sm text-destructive">{errors.name.message}</p>
//         )}
//       </div>

//       <div>
//         <label className="mb-2 block font-medium">{t("logo")}</label>
//         <ImageUpload
//           onUpload={(file) => setValue("logo", file)}
//           accept="image/*"
//         />
//       </div>

//       <div>
//         <label className="mb-2 block font-medium">{t("description")}</label>
//         <Textarea
//           {...register("description")}
//           placeholder={t("descriptionPlaceholder")}
//           rows={4}
//         />
//       </div>

//       <Button type="submit" disabled={isLoading}>
//         {isLoading ? t("creating") : t("createBrand")}
//       </Button>
//     </form>
//   );
// }
import React from "react";

const BrandForm = () => {
  return <div>BrandForm</div>;
};

export default BrandForm;
