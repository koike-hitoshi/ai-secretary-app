# AI秘書（AI Secretary）

統合型AI秘書Webアプリ。タスク管理・文章校正・議事録・リサーチ・Googleカレンダーを一つのアプリで提供します。

## ドキュメント

| ファイル | 内容 |
|----------|------|
| [docs/REQUIREMENTS.md](docs/REQUIREMENTS.md) | **要件定義書**（正式） |
| [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) | デザインシステム（トークン・ガイド） |
| [docs/PRODUCT_SPEC.md](docs/PRODUCT_SPEC.md) | 実装補足（API・認証・音声アップロード） |

## 開発

```bash
cd secretary-platform
npm install
npm run dev
```

http://localhost:3000

## スタック

- Next.js 16（App Router）、React 19、TypeScript、Tailwind CSS v4
- Supabase、Vercel
- OpenAI、Perplexity、AssemblyAI、Google Calendar API
