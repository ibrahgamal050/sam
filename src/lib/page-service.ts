export interface PageInput {
    restaurantId: string
    subdomain: string
    name: string
    slug: string
    language: 'en' | 'ar'
    headerImage?: string
    isPublished?: boolean
    seo: any
    components: any[]
  }
  
  export interface Page extends PageInput {
    _id: string
    metadata: any
  }
  
  export class PageService {
    static async getPages(restaurantId: string): Promise<Page[]> {
      const res = await fetch(`/api/pages/${restaurantId}`)
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to fetch pages')
      }
      return res.json()
    }
  
    static async getPage(restaurantId: string, pageId: string): Promise<Page> {
      const res = await fetch(`/api/pages/${restaurantId}/${pageId}`)
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to fetch page')
      }
      return res.json()
    }
  
    static async createPage(data: PageInput): Promise<Page> {
      const res = await fetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to create page')
      }
      return res.json()
    }
  
    static async updatePage(restaurantId: string, pageId: string, data: Partial<PageInput>): Promise<Page> {
      const res = await fetch(`/api/pages/${restaurantId}/${pageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to update page')
      }
      return res.json()
    }
  
    static async deletePage(restaurantId: string, pageId: string): Promise<void> {
      const res = await fetch(`/api/pages/${restaurantId}/${pageId}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to delete page')
      }
    }
  }