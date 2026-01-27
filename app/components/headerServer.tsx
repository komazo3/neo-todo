import { auth } from "@/auth";
import HeaderClient from "./headerClient";

export default async function HeaderServer() {
  const session = await auth();
  const user = session?.user
    ? {
        name: session.user.name ?? "",
        image: session.user.image ?? "",
        email: session.user.email ?? "",
      }
    : null;

  return <HeaderClient user={user} />;
}
