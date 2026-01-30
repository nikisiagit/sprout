export interface Space {
    id: string;
    slug: string;
    name: string;
    logo_url?: string; // Optional custom logo
    icon?: string; // Optional emoji/icon
    owner_id: string; // Link to User
    created_at: string;
}

export interface ChangelogItem {
    id: string;
    date: string;
    title: string;
    description: string;
    tags: string[];
}
