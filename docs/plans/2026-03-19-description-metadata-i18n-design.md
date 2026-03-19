# Description Metadata I18n Design

## Goal

Localize workout descriptions from an optional metadata snapshot in the same bucket.

## Source

Use metadata JSON shaped like:

```json
{
  "workout-id": {
    "description": {
      "general": {
        "original": "...",
        "de": "...",
        "en": "...",
        "ja": "...",
        "ko": "...",
        "zh-CN": "..."
      }
    }
  }
}
```

## Fallback

For each locale:

1. localized metadata field
2. metadata `original`
3. existing snapshot `description.general`

## Approach

- Add an optional metadata key to the manifest loader.
- Load metadata only when the manifest includes that key.
- Keep the raw detail catalog unchanged at load time except for exposing metadata alongside it.
- Apply locale-specific description merging in the page-builder loop before generating locale pages.

## Testing

- Verify metadata is fetched when the manifest contains the new key.
- Verify description fallback order is `locale -> original -> existing snapshot`.
