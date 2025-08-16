export default {
  options: {
    alias: 'routes' // task names look like: routes:list, routes:dump
  },

  tasks(self) {
    return {
      list: {
        usage: 'List all Express routes currently registered (table output)',
        options: {
          include: 'Comma-separated prefixes or regexes (e.g., /api,/^\\/@apostrophecms\\/)',
          exclude: 'Comma-separated prefixes or regexes (e.g., /apos,/assets)',
          methods: 'Comma-separated HTTP methods (e.g., GET,POST)'
        },
        async task(argv) {
          const app = self.apos.app;
          if (!app || !app._router) {
            console.error('Express router not available. Ensure the app has booted.');
            process.exit(1);
          }
          const include = parseFilters(argv.include);
          const exclude = parseFilters(argv.exclude);
          const allow = (argv.methods || '')
            .split(',').map(s => s && s.trim().toUpperCase()).filter(Boolean);

          const rows = listAllExpressRoutes(app)
            .filter(r => (!exclude.length || !isExcluded(r.path, exclude)))
            .filter(r => (!include.length || matchesFilters(r.path, include)))
            .filter(r => (!allow.length || allow.includes(r.method)))
            .sort((a, b) => a.path.localeCompare(b.path) || a.method.localeCompare(b.method));

          const wMethod = Math.max(6, ...rows.map(r => r.method.length));
          const header = `${'METHOD'.padEnd(wMethod)}  PATH`;
          console.log(header);
          console.log('-'.repeat(header.length));
          for (const r of rows) {
            console.log(`${r.method.padEnd(wMethod)}  ${r.path}`);
          }
          console.log(`\n${rows.length} route(s).`);
        }
      },

      dump: {
        usage: 'Dump all Express routes as JSON (use --output=routes.json to save)',
        options: {
          include: 'Comma-separated prefixes or regexes',
          exclude: 'Comma-separated prefixes or regexes',
          methods: 'Comma-separated HTTP methods',
          output: 'Output file path (e.g., routes.json). If omitted, prints to stdout.'
        },
        async task(argv) {
          const app = self.apos.app;
          if (!app || !app._router) {
            console.error('Express router not available. Ensure the app has booted.');
            process.exit(1);
          }
          const include = parseFilters(argv.include);
          const exclude = parseFilters(argv.exclude);
          const allow = (argv.methods || '')
            .split(',').map(s => s && s.trim().toUpperCase()).filter(Boolean);

          const routes = listAllExpressRoutes(app)
            .filter(r => (!exclude.length || !isExcluded(r.path, exclude)))
            .filter(r => (!include.length || matchesFilters(r.path, include)))
            .filter(r => (!allow.length || allow.includes(r.method)))
            .sort((a, b) => a.path.localeCompare(b.path) || a.method.localeCompare(b.method));

          const payload = {
            count: routes.length,
            routes
          };

          if (argv.output) {
            const fs = await import('node:fs/promises');
            await fs.writeFile(argv.output, JSON.stringify(payload, null, 2), 'utf8');
            console.log(`✅ Wrote ${routes.length} routes to ${argv.output}`);
          } else {
            console.log(JSON.stringify(payload, null, 2));
          }
        }
      }
    };

    // ===== helpers (module-local; no external dependency) =====
    function parseFilters(csv) {
      if (!csv) return [];
      return String(csv)
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
        .map(s => {
          if (s.startsWith('/^')) {
            const body = s.slice(1, s.lastIndexOf('/'));
            const flags = s.slice(s.lastIndexOf('/') + 1) || 'i';
            return new RegExp(body, flags);
          }
          return s; // prefix string
        });
    }

    function matchesFilters(path, filters) {
      if (!filters || !filters.length) return true;
      for (const f of filters) {
        if (f instanceof RegExp) {
          if (f.test(path)) return true;
        }
        else if (typeof f === 'string' && path.startsWith(f)) return true;
      }
      return false;
    }

    function isExcluded(path, exclude) {
      for (const f of (exclude || [])) {
        if (f instanceof RegExp) {
          if (f.test(path)) return true;
        }
        else if (typeof f === 'string' && path.startsWith(f)) return true;
      }
      return false;
    }

    function regexToMount(re) {
      try {
        const src = re.toString();
        const m = src.match(/^\/\^\\\/(.+?)\\\/?\(\?=\\\/(?:\|\$)\)\/[a-z]*$/);
        return m ? ('/' + m[1].replace(/\\\//g, '/')) : '';
      } catch {
        return '';
      }
    }

    function listAllExpressRoutes(app) {
      const seen = new Set();
      const out = [];
      const visit = (stack, prefix = '') => {
        if (!stack) return;
        for (const layer of stack) {
          // Mounted router (app.use('/api', router))
          if (layer && layer.handle && layer.handle.stack && layer.regexp && !layer.route) {
            const mount = layer.path || regexToMount(layer.regexp) || '';
            visit(layer.handle.stack, prefix + mount);
            continue;
          }
          // Concrete route
          if (layer && layer.route && layer.route.path) {
            const path = prefix + layer.route.path;
            const methods = Object.keys(layer.route.methods || {}).map(m => m.toUpperCase());
            for (const method of methods) {
              const key = method + ' ' + path;
              if (!seen.has(key)) {
                seen.add(key);
                out.push({
                  method,
                  path
                });
              }
            }
          }
        }
      };
      visit(app && app._router && app._router.stack);
      return out;
    }
  }
};
