// // components/locale-switcher.tsx
// 'use client';

// import Link from 'next/link';
// import { usePathname } from 'next/navigation';
// import { locales } from '@/config/site';
// import { Button } from '@/components/ui/button';
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu';

// export function LocaleSwitcher() {
//   const pathname = usePathname();

//   const removeLocaleFromPath = (path: string) => {
//     const localePattern = new RegExp(`^/(${locales.join('|')})`);
//     return path.replace(localePattern, '');
//   };

//   const currentPathWithoutLocale = removeLocaleFromPath(pathname);

//   return (
//     <DropdownMenu>
//       <DropdownMenuTrigger asChild>
//         <Button variant="outline" size="sm">
//           {pathname.split('/')[1]?.toUpperCase() || 'EN'}
//         </Button>
//       </DropdownMenuTrigger>
//       <DropdownMenuContent align="end">
//         {locales.map((locale) => (
//           <DropdownMenuItem key={locale} asChild>
//             <Link href={`/${locale}${currentPathWithoutLocale}`}>
//               {locale.toUpperCase()}
//             </Link>
//           </DropdownMenuItem>
//         ))}
//       </DropdownMenuContent>
//     </DropdownMenu>
//   );
// }
import React from 'react'

const LocaleSwitcher = () => {
  return (
    <div>locale-switcher</div>
  )
}

export default LocaleSwitcher
