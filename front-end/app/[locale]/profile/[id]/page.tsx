import UserProfileClient from "@/components/profile/UserProfileClient";

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id } = await params;

  return <UserProfileClient id={Number(id)} />;
}
