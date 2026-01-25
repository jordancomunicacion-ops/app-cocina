import { fetchPackaging } from '@/app/lib/actions/settings';
import PackagingListClient from './packaging-list-client';

export default async function PackagingList() {
    const packaging = await fetchPackaging();
    return <PackagingListClient packaging={packaging} />;
}
