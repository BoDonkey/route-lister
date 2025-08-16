# @bodonkey/apostrophecms-route-lister

A powerful ApostropheCMS task extension for listing and analyzing all Express routes in your application. Perfect for debugging, documentation, or generating OpenAPI specifications.

## Features

- 🔍 **List all routes** - Display all registered Express routes in a clean table format
- 📤 **JSON export** - Dump routes as JSON for further processing or automation
- 🎯 **Flexible filtering** - Include/exclude routes by path patterns or regex
- 🔧 **Method filtering** - Filter by HTTP methods (GET, POST, etc.)
- 🏗️ **Router-aware** - Properly handles mounted routers and nested routes
- ✨ **Zero dependencies** - Lightweight and self-contained

## Installation

```bash
npm install @bodonkey/apostrophecms-route-lister
```

## Configuration

Add the extension to your ApostropheCMS project in `app.js`:

```javascript
export default{
  // other properties
  modules: {
    '@bodonkey/apostrophecms-route-lister': {}
  }
};
```

## Usage

### List Routes (Table Format)

Display all routes in a formatted table:

```bash
node app @bodonkey/apostrophecms-route-lister:list-routes
```

#### Filtering Options

### String Patterns
- Simple string matching uses `startsWith()` logic
- `/api` matches `/api/v1/users`, `/api/v1/pages`, etc.
- `/customroute` matches `/customroute/xxx`, `/customroute/yyy`, etc.

### Regex Patterns
- Regex patterns must start with `/^` and end with `/` plus optional flags
- `/^.*@apostrophecms.*/i` matches any route containing `@apostrophecms` (case-insensitive)
- `/^\/api\/v[0-9]+/` matches `/api/v1`, `/api/v2`, etc.
- `/^\/users\/[0-9]+$/` matches `/users/123` but not `/users/abc`

**Include specific routes:**
```bash
# Include only API routes
node app @bodonkey/apostrophecms-route-lister:list-routes --include=/api

# Include multiple patterns
node app @bodonkey/apostrophecms-route-lister:list-routes --include=/api,/admin

# Use regex patterns
node app @bodonkey/apostrophecms-route-lister:list-routes --include="/^\/api\/v[0-9]+/"
```

**Exclude routes:**
```bash
# Exclude routes containing @apostrophecms anywhere
node app @bodonkey/apostrophecms-route-lister:list-routes --exclude="/^.*@apostrophecms.*/"

# Exclude multiple patterns (mix of prefix and regex)
node app @bodonkey/apostrophecms-route-lister:list-routes --exclude=/@apostrophecms,"/^.*internal.*/"
```

**Filter by HTTP methods:**
```bash
# Show only GET routes
node app @bodonkey/apostrophecms-route-lister:list-routes --methods=GET

# Show GET and POST routes
node app @bodonkey/apostrophecms-route-lister:list-routes --methods=GET,POST
```

**Combined filtering:**
```bash
node app @bodonkey/apostrophecms-route-lister:list-routes --include=/api --exclude=/api/internal --methods=GET,POST
```

### Export Routes (JSON Format)

Export routes as JSON for automation or further processing:

```bash
# Print to stdout
node app @bodonkey/apostrophecms-route-lister:dump-routes

# Save to file
node app @bodonkey/apostrophecms-route-lister:dump-routes --output=routes.json

# With filtering
node app @bodonkey/apostrophecms-route-lister:dump-routes --include=/api --methods=GET,POST --output=api-routes.json
```

#### JSON Output Format

```json
{
  "count": 42,
  "routes": [
    {
      "method": "GET",
      "path": "/api/users"
    },
    {
      "method": "POST", 
      "path": "/api/users"
    }
  ]
}
```

## Examples

### Basic Route Listing
```bash
$ node app @bodonkey/apostrophecms-route-lister:list-routes

METHOD  PATH
----------------
GET     /
GET     /api/pages
POST    /api/pages
GET     /api/users/:id
DELETE  /api/users/:id

5 route(s).
```

### API Routes Only
```bash
$ node app @bodonkey/apostrophecms-route-lister:list-routes --include=/api --methods=GET

METHOD  PATH
----------------
GET     /api/v1/pages
GET     /api/v1/users
GET     /api/v1/users/:id

3 route(s).
```

### Export for OpenAPI Generation
```bash
# Export API routes for spec generation
node app @bodonkey/apostrophecms-route-lister:dump-routes --include=/api --output=api-routes.json

✅ Wrote 15 routes to api-routes.json
```

## Filter Syntax

### String Patterns
- Simple string matching uses `startsWith()` logic
- `/api` matches `/api/users`, `/api/pages`, etc.
- `/admin` matches `/admin/login`, `/admin/dashboard`, etc.

### Regex Patterns  
- Regex patterns must start with `/^` and end with `/` plus optional flags
- `/^\/api\/v[0-9]+/i` matches `/api/v1`, `/api/v2` (case insensitive)
- `/^\/users\/[0-9]+$/` matches `/users/123` but not `/users/abc`

### Multiple Filters
- Use comma separation: `--include=/api,/admin`
- Multiple filters use OR logic (matches ANY pattern)
- Combine include/exclude for precise control

## Use Cases

- **API Documentation** - Generate route lists for documentation
- **OpenAPI Spec Generation** - Export routes as JSON for spec builders
- **Debugging** - Identify route conflicts or unexpected registrations
- **Security Audits** - Review all exposed endpoints
- **Testing** - Validate route registration in CI/CD pipelines

## Requirements

- ApostropheCMS 4.0.0 or higher
- Node.js 22+ (for ES modules support)

## Contributing

Issues and pull requests are welcome! Please visit the [GitHub repository](https://github.com/BoDonkey/apostrophecms-route-lister).

## License

MIT © BoDonkey (Robert Means)

## Related Projects

This extension pairs perfectly with OpenAPI spec generators and API documentation tools.