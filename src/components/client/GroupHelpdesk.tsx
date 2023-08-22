import { Tabs } from "../form/Tabs";
import { Archive } from "./tickets/Archive";
import { Mine } from "./tickets/Mine";
import { Recent } from "./tickets/Recent";

export const GroupHelpdesk = () => {
    return (
        <div
            className="flex flex-col gap-4"
        >
            <Tabs
                tabs={[
                    {
                        key: "active",
                        display: "Recent Activity",
                        content: (
                            <Recent />
                        )
                    },
                    {
                        key: "my-requests",
                        display: "My Tickets",
                        content: (
                            <Mine />
                        )
                    },
                    {
                        key: "closed",
                        display: "Closed Tickets",
                        content: (
                            <Archive />
                        )
                    }
                ]}
            />
        </div>
    )
}