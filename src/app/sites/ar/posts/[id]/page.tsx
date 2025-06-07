import { SinglePostPage } from "@/components/ar/single-post-page"

export default function PostDetail({ params }: { params: { id: string } }) {
  return <SinglePostPage id={params.id} />
}
