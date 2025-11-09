import { CustomPortableText } from '@/components/CustomPortableText'
import { Header } from '@/components/Header'
import { sanityFetch } from '@/sanity/lib/live'
import { pagesBySlugQuery, slugsByTypeQuery } from '@/sanity/lib/queries'
import type { Metadata, ResolvingMetadata } from 'next'
import { toPlainText, type PortableTextBlock } from 'next-sanity'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { data: page } = await sanityFetch({
    query: pagesBySlugQuery,
    params,
    stega: false,
  })

  return {
    title: page?.title,
    description: page?.overview ? toPlainText(page.overview) : (await parent).description,
  }
}

export async function generateStaticParams() {
  const { data } = await sanityFetch({
    query: slugsByTypeQuery,
    params: { type: 'page' },
    stega: false,
    perspective: 'published',
  })
  return data
}

export default async function PageSlugRoute({ params }: Props) {
  const { data } = await sanityFetch({ query: pagesBySlugQuery, params })

  // Only show the 404 page if we're in production, when in draft mode we might be about to create a page on this slug, and live reload won't work on the 404 route
  if (!data?._id && !(await draftMode()).isEnabled) {
    notFound()
  }

  const { body, overview, title, image, list } = data ?? {}

  console.log("List", list);

  console.log("image", image);
  


  return (
    <div>
      <div className="mb-14">
        {/* Header */}
        <Header
          id={data?._id || null}
          type={data?._type || null}
          path={['overview']}
          title={title || (data?._id ? 'Untitled' : '404 Page Not Found')}
          description={overview}
        />

        {/* Image */}
        {image?.asset && (
          <div className="mt-8 mb-12">
            <img
              src={image.asset.url}
              alt={image.alt ? image.alt : "No alt text provided"}
              className="w-full h-auto rounded-lg shadow-lg size-200 object-cover"
            />
          </div>
        )}

        {/* Body */}
        {body && (
          <CustomPortableText
            id={data?._id || null}
            type={data?._type || null}
            path={['body']}
            paragraphClasses="font-serif max-w-3xl text-gray-600 text-xl"
            value={body as unknown as PortableTextBlock[]}
          />
        )}

        {/* List of skills */}
        {list && (
          <div className="mt-8 mb-12">
            <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {list.map((item: any, index: number) => (
                <li key={index} className="flex items-center justify-center p-4 border rounded-lg shadow-sm bg-white">
                  <img
                    src={item.asset.url}
                    alt={item.alt ? item.alt : `List item ${index + 1}`}
                    className="max-h-16 object-contain"
                  />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="absolute left-0 w-screen border-t" />
    </div>
  )
}
