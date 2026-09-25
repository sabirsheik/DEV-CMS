export interface NavMenuItem {
  id: string;
  label: string;
  url: string;
  target?: '_self' | '_blank';
  isExternal?: boolean;
  order: number;
  children?: NavMenuItem[];
}

export interface NavigationMenu {
  id: string;
  name: string;
  location: 'main_header' | 'footer_primary' | 'footer_secondary' | 'mobile_drawer' | 'sidebar_quick';
  items: NavMenuItem[];
  updatedAt: string;
}

export interface CmsPageItem {
  id: string;
  title: string;
  slug: string;
  template: 'default' | 'landing' | 'docs' | 'full_width' | 'contact';
  parentId?: string;
  status: 'published' | 'draft' | 'scheduled';
  author: string;
  depth: number;
  updatedAt: string;
}
