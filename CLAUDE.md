# web-kosh

> **Active work is on branch `version2`, not `master`.** This branch
> (`master`) is the old, pre-migration site: plain HTML/CSS/JS in `www/`,
> deployed via `.github/workflows/deploy.yml` (`aws s3 sync www/. ...`).
>
> `version2` has an in-progress migration to Angular: the old `www/` content
> moved to `archive/` (kept for reference, never edited), and a new Angular
> app lives in `web/`, built around a composition-first structure (a page is
> assembled from small standalone components — see `version2`'s own
> `CLAUDE.md` for the full structure once you're on that branch).
>
> If you're reading this from a fresh session: run `git branch` / `git log
> --oneline -3` first. If you're on `master` and the user's ask relates to
> the Angular site, CV page, timeline, or anything migration-related, switch
> to `version2` (`git checkout version2`) rather than rebuilding anything
> here — it likely already exists there. Don't assume `version2` is up to
> date with `master` or vice versa without checking; the two have diverged
> and nobody has merged them yet.
