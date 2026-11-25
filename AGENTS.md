<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

- When legacy Firestore is absent, affiliate catalog reads use the existing offers client and only explicit commission metadata; this avoids configuration crashes and invented programs. Affiliate links must not be fabricated before a persistent link store is connected.

## User-requested product and UX requirements

- **Affiliates page:** Explain the flow briefly when documenting or changing it: users browse active products whose creators enabled a valid affiliate rate, review and accept the product's terms, then generate and share a personal link. Keep the limitations clear: links identify the affiliate, but views, sales, and commissions are not currently tracked.
- **Affiliate catalogue states:** Keep loading, load failure, and successful-but-empty results visually and semantically distinct. For a successful empty catalogue, explain that no eligible programme is currently available and provide a retry/refresh action. Do not show the empty-catalogue state as a substitute for a load error.
- **Mobile UX and typography:** Follow the mobile usability and typographic recommendations supplied by the user. Preserve readable type hierarchy and spacing on small screens; make controls and forms touch-friendly; prevent horizontal overflow; allow long labels and filenames to remain legible; and ensure tabs or dense content can be navigated on narrow viewports. Keep keyboard behavior appropriate for the input (including numeric OTP fields) and support expected keyboard submission for messaging forms.
- **Preview:** Keep the project's Vite preview hostname explicitly allowed in `vite.config.ts` when that hostname is in use, and verify the preview URL returns a successful HTTP response after starting the development server.
- **Delivery:** For requested GitHub updates, push the intended changes to `origin/main` and verify that the local `HEAD` and `origin/main` resolve to the same commit. Do not include unrelated generated or temporary files in the change.
