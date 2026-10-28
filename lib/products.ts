export type Product={slug:string;name:string;price:number;category:string;description:string;emoji:string};
export const products:Product[]=[
{slug:'smart-photo-slate',name:'Smart Photo Slate',price:24.99,category:'Photo Gifts',description:'A personalised photo slate with a hidden NFC memory link.',emoji:'🖼️'},
{slug:'smart-memory-plaque',name:'Smart Memory Plaque',price:29.99,category:'Keepsakes',description:'A beautiful plaque that opens a private photo and voice memory.',emoji:'💝'},
{slug:'smart-pet-memory',name:'Smart Pet Memory',price:24.99,category:'Pet Gifts',description:'Keep a favourite pet photo, story and voice message together.',emoji:'🐾'},
{slug:'smart-baby-keepsake',name:'Smart Baby Keepsake',price:24.99,category:'Baby Gifts',description:'A lasting baby keepsake with photo, message and recorded voice.',emoji:'🧸'},
{slug:'smart-wedding-memory',name:'Smart Wedding Memory',price:34.99,category:'Wedding',description:'A wedding or anniversary gift with a hidden digital memory.',emoji:'💍'},
{slug:'smart-video-memory',name:'Smart Video Memory',price:39.99,category:'Premium',description:'A premium personalised gift prepared for photo, audio and video memories.',emoji:'🎬'}];
export const money=(n:number)=>`£${n.toFixed(2)}`;
