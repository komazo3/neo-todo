import { auth } from "@/auth";
import Link from "next/link";

function getInitial(name?: string | null) {
  const n = (name ?? "").trim();
  if (!n) return "?";
  return n[0].toUpperCase();
}

export default async function UserInfo() {
  const session = await auth();

  // 未ログイン想定（ヘッダに出すなら空にしてもOK）
  if (!session?.user) return null;

  const name = session.user.name ?? "User";
  const image = session.user.image;

  return (
    <Link href="/mypage" className="rounded-xl border-gray-400">
      <div className="flex items-center gap-2  px-2 py-1">
        {/* Avatar */}
        <div className="relative h-9 w-9 overflow-hidden rounded-full border border-slate-200 bg-white">
          {image ? (
            // next/image を使ってもOK（ポートフォリオなら推奨）
            <img
              src={image}
              alt={`${name} avatar`}
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="grid h-full w-full place-items-center text-sm font-semibold text-slate-700">
              {getInitial(name)}
            </div>
          )}
        </div>

        {/* Name */}
        <div className="hidden sm:block">
          <p className="max-w-[160px] truncate text-sm font-semibold text-slate-900">
            {name + " 様"}
          </p>
        </div>
      </div>
    </Link>
  );
}
