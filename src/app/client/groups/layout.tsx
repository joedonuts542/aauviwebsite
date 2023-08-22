import { GroupProvider } from "./group"

export default function GroupLayout({ children }: {
    children: React.ReactNode
}) {
    return (
        <GroupProvider>{children}</GroupProvider>
    )
}