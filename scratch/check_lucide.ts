import * as Lucide from 'lucide-react';
console.log(Object.keys(Lucide).filter(k => k.toLowerCase().includes('face') || k.toLowerCase().includes('social') || k.toLowerCase().includes('icon')));
console.log('Total icons:', Object.keys(Lucide).length);
