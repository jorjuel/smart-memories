import {products} from './products';

export const giftStudioSlugs=['smart-photo-slate','coaster-set','photo-mug','keyring','mouse-mat'] as const;
export type GiftStudioSlug=typeof giftStudioSlugs[number];
export type GiftStudioSize={label:string;width:number;height:number};
type GiftStudioConfig={
 slug:GiftStudioSlug;name:string;label:string;price:number;
 sizes:GiftStudioSize[];shape:'slate'|'coaster'|'mug'|'keyring'|'mat';
 directions:boolean;
};
const configurations:Record<GiftStudioSlug,Omit<GiftStudioConfig,'price'>>={
 'smart-photo-slate':{
  slug:'smart-photo-slate',name:'Personalised Photo Slate',label:'Slate',shape:'slate',directions:true,
  sizes:[{label:'14 × 14 cm',width:14,height:14},{label:'19 × 19 cm',width:19,height:19},
   {label:'14 × 19 cm',width:14,height:19},{label:'19 × 29 cm',width:19,height:29}],
 },
 'coaster-set':{
  slug:'coaster-set',name:'Personalised Coasters',label:'Coaster',shape:'coaster',directions:false,
  sizes:[{label:'Single',width:1,height:1},{label:'Set of 2',width:1,height:1},
   {label:'Set of 4',width:1,height:1},{label:'Set of 6',width:1,height:1}],
 },
 'photo-mug':{
  slug:'photo-mug',name:'Personalised Mug',label:'Mug',shape:'mug',directions:false,
  sizes:[{label:'Standard Mug',width:2,height:1}],
 },
 'keyring':{
  slug:'keyring',name:'Personalised Keyring',label:'Keyring',shape:'keyring',directions:true,
  sizes:[{label:'Standard',width:3,height:4}],
 },
 'mouse-mat':{
  slug:'mouse-mat',name:'Personalised Mouse Mat',label:'Mouse Mat',shape:'mat',directions:false,
  sizes:[{label:'Standard',width:8,height:5}],
 },
};
export function isGiftStudioProduct(slug:string):slug is GiftStudioSlug{
 return giftStudioSlugs.some(item=>item===slug);
}
export function getGiftStudioConfig(slug:string):GiftStudioConfig|null{
 if(!isGiftStudioProduct(slug))return null;
 const catalog=products.find(product=>product.slug===slug);
 if(!catalog)return null;
 return {...configurations[slug],price:catalog.price};
}
