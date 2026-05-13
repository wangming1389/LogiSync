const fs = require('fs');
let code = fs.readFileSync(
	'apps/web/src/components/layout/AppLayout.tsx',
	'utf8',
);

code = code.replace(
	/\{w-4 h-4 text-white\/60 transition-transform \}/g,
	"{`w-4 h-4 text-white/60 transition-transform ${roleDropdown ? 'rotate-180' : ''}`}",
);
code = code.replace(
	/\{w-2 h-2 rounded-full \}/g,
	"{`w-2 h-2 rounded-full ${currentRole === r.value ? 'bg-white' : 'bg-transparent'}`}",
);
code = code.replace(
	/\{[\s\S]*?ext-sm \}/g,
	"{`text-sm ${currentRole === r.value ? 'text-white font-medium' : 'text-white/70'}`}",
);
code = code.replace(
	/\{[\s\S]*?lex items-center gap-3 px-3 py-2\.5 rounded-lg text-sm transition-colors relative \}/g,
	"{`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors relative ${isActive ? 'text-white bg-white/10' : 'text-white/60 hover:bg-white/5 hover:text-white/90'}`}",
);

fs.writeFileSync('apps/web/src/components/layout/AppLayout.tsx', code, 'utf8');
console.log('AppLayout.tsx fixed!');
