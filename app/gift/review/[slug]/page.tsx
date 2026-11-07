import {notFound} from 'next/navigation';
import SlateReviewPage from '@/app/slate/review/page';
import {isGiftStudioProduct} from '@/lib/giftStudioProducts';

export default async function GiftReviewRoute({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;
 if(!isGiftStudioProduct(slug))notFound();
 return <SlateReviewPage productSlug={slug}/>;
}
