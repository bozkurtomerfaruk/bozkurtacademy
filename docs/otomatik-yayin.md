# Otomatik yayın: Worker ve Firestore kuralları

Bir PR main'e birleşince GitHub Actions şunları kendisi yapar (`.github/workflows/deploy.yml`):

- `worker/` değiştiyse Worker **schreiben-kontrol** Cloudflare'e yayınlanır (wrangler, ayarlar `worker/wrangler.jsonc`).
- `firestore.rules` değiştiyse kurallar Firebase'e (Cloud Firestore) yayınlanır.
- Değişmeyen kısım yayınlanmaz. Önce testler çalışır (`npm test`, `npm run test:worker`, `npm run test:deploy`); biri kırmızıysa hiçbir şey yayınlanmaz.
- Elle de başlatılabilir: GitHub → **Actions** → **Otomatik yayın (Worker ve Firestore kuralları)** → **Run workflow**.

Ücret yok: depo herkese açık olduğu için GitHub Actions ücretsiz; Cloudflare Free plan, Google tarafında Workload Identity Federation ve Firebase Rules API ücretsiz. Hiçbir adımda kart istenmez. **Bir ekran kart ya da faturalandırma (billing) isterse dur ve bana yaz.**

Elle yayın yolu yedek olarak duruyor (aşağıda "Elle yayın").

> **Not:** Canlı Worker'da telc C1 güncellemesi henüz yok (panel açılmadığı için yapıştırılamadı). Aşağıdaki ilk elle yayın (Adım 5) bu güncellemeyi de getirir.

---

## Nasıl korunuyor?

| Konu | Nasıl |
| --- | --- |
| Paneldeki değişkenler (FIREBASE_API_KEY, FIREBASE_PROJECT_ID, SITE_URL, ALLOWED_ORIGINS, AI_EMAIL, TEACHER_UID, MAIL_DAILY_LIMIT) | `worker/wrangler.jsonc` içinde `"keep_vars": true`; dosyada hiç `vars` yok. Wrangler panelde tanımlı düz metin değişkenlere dokunmaz. |
| Gizli değerler (AI_PASSWORD, BREVO_API_KEY) | `wrangler deploy` secret'ları her zaman korur; dosyada secret yok. |
| Yapay zekâ bağlantısı | Dosyada `"ai": { "binding": "AI" }`; her yayında aynı adla gönderilir. |
| Log ayarı | Dosyada `observability` paneldekiyle aynı yazılı (Logs açık, invocation logs, persist). |
| **Ayar fotoğrafı** | Yayından önce canlı ayarlar okunur. Uyumluluk tarihi, bayraklar, log ayarı, önizleme adresleri ya da bağlantılar dosyayla uyuşmazsa **yayın yapılmaz**, iş kırmızı olur ve paneldeki değerler yapıştırılacak hâliyle yazılır. Yayından sonra yeniden okunur: tek bir değişken/secret/bağlantı adı eksikse ya da ayar değiştiyse iş kırmızı olur. Değerler hiç okunmaz, yazdırılmaz; sadece adlar. |
| Canlı kontrol | Yayından sonra `OPTIONS /check` → 204 (ALLOWED_ORIGINS yerinde) ve belirteçsiz `POST /check` → 401 (kod çalışıyor). Yapay zekâ kotası ve Firestore kullanılmaz. |
| Kurallar | Firebase önce yeni kuralları derler; hata varsa canlı kurallar değişmez. Sonra canlı sürümün yeni kuralı gösterdiği ve metnin aynı olduğu doğrulanır. |
| Kim çalıştırabilir? | Sadece bu depo ve sadece `main` dalı. PR'larda hiç çalışmaz. Gizli değerler **production** ortamında; o ortama sadece `main` erişebilir. |
| Cloudflare izni | Sadece bu hesabın **Workers Scripts: Edit** izni olan token. |
| Google izni | Anahtar dosyası yok (Workload Identity Federation). Servis hesabının tek rolü **Firebase Rules Admin**; sadece bu depo + main + production ortamı giriş yapabilir; belirteç 5 dakika geçerli. |
| Otomatik yayın anahtarı | Depo değişkeni `OTOMATIK_YAYIN` = `acik` olmadıkça birleştirince yayın yapılmaz (sadece testler). Acil durumda bu değişkeni silmek otomatik yayını durdurur. |

---

## Tek seferlik kurulum

Sıra: Cloudflare (Adım 1) → Google (Adım 2) → GitHub (Adım 3) → ilk elle çalıştırma (Adım 4–6).

### Adım 1: Cloudflare API token'ı

1. <https://dash.cloudflare.com> → sağ üstte profil simgesi → **My Profile** → solda **API Tokens**.
2. **Create Token** → en altta **Custom token** → **Get started**.
3. **Token name:** `github-actions-schreiben-kontrol`
4. **Permissions:** tek satır:
   - `Account` · `Workers Scripts` · `Edit`
   - Başka satır ekleme (Zone, DNS, User vb. yok).
5. **Account Resources:** `Include` · kendi hesabın (listede tek hesap var).
6. **Client IP Address Filtering:** boş bırak (GitHub'ın adresleri sabit değil).
7. **TTL:** boş bırak (süresiz).
8. **Continue to summary** → özet sadece "Workers Scripts:Edit" göstermeli → **Create Token**.
9. Token **bir kez** gösterilir: kopyala, Adım 3'e kadar güvenli bir yerde tut. Sohbete ya da bir dosyaya yapıştırma.
10. **Account ID:** Cloudflare ana sayfa → **Workers & Pages** → sağ sütunda **Account ID** → kopyala.

### Adım 2: Google Cloud (Firebase projesi) – anahtarsız giriş

Proje: `bozkurtacademy-8ab85` (Firebase projesiyle aynı Google Cloud projesi). Aşağıdaki her şey <https://console.cloud.google.com> üzerinde, üstteki proje seçicide **bozkurtacademy-8ab85** seçiliyken yapılır.

**2.1 Proje numarası.** Ana sayfa (Dashboard) → **Project info** kartı → **Project number** (ör. `123456789012`). Not al; aşağıda `PROJE_NO` diye geçiyor.

**2.2 API'leri aç.** Arama çubuğuna adını yaz → aç → **Enable** (açıksa "Manage" görünür, bir şey yapma):

- IAM Service Account Credentials API
- Security Token Service API
- Identity and Access Management (IAM) API
- Firebase Rules API (büyük ihtimalle zaten açık)

**2.3 Servis hesabı.** Menü → **IAM & Admin** → **Service Accounts** → **+ Create service account**:

1. **Service account name:** `kural-yayinci` → ID kendiliğinden `kural-yayinci` olur. Açıklama: `GitHub Actions: sadece Firestore kurallarını yayınlar` → **Create and continue**.
2. **Permissions → Select a role:** `Firebase Rules Admin` (Firebase grubu altında) → **Continue**.
3. **Principals with access:** boş → **Done**.
4. Hesabın e-postası: `kural-yayinci@bozkurtacademy-8ab85.iam.gserviceaccount.com`.
5. **Keys sekmesine girme, anahtar oluşturma.** Bu kurulumda anahtar dosyası yok.

**2.4 Workload Identity havuzu ve sağlayıcı.** Menü → **IAM & Admin** → **Workload Identity Federation** → **Create pool** (ya da **Get started**):

1. **Pool:** Name `github`, Pool ID `github` → **Continue**.
2. **Add a provider to pool:**
   - Select a provider: **OpenID Connect (OIDC)**
   - Provider name: `github-actions`, Provider ID `github-actions`
   - Issuer (URL): `https://token.actions.githubusercontent.com`
   - Audiences: **Default audience** → **Continue**
3. **Configure provider attributes** (Attribute mapping), **Add mapping** ile:

   | Google | OIDC |
   | --- | --- |
   | `google.subject` | `assertion.sub` |
   | `attribute.repository` | `assertion.repository` |
   | `attribute.repository_id` | `assertion.repository_id` |
   | `attribute.repository_owner_id` | `assertion.repository_owner_id` |
   | `attribute.ref` | `assertion.ref` |
   | `attribute.environment` | `assertion.environment` |

4. **Attribute conditions** → **Add condition** → şunu aynen yapıştır (64966748 deponun sahibinin, 1243970101 deponun değişmeyen numarasıdır; depo adı değişse ya da başka biri aynı adı alsa bile sadece bu depo girer):

   ```
   assertion.repository_id == '1243970101' && assertion.repository_owner_id == '64966748' && assertion.ref == 'refs/heads/main' && assertion.environment == 'production'
   ```

5. **Save**.
6. Havuz sayfasında sağlayıcının tam adı: `projects/PROJE_NO/locations/global/workloadIdentityPools/github/providers/github-actions`. Bunu Adım 3'te `GCP_WIF_PROVIDER` olarak gireceksin.

**2.5 Havuza servis hesabını kullanma izni.** Workload Identity Federation → `github` havuzu → üstte **Grant access**:

1. **Grant access using service account impersonation** seç.
2. **Service account:** `kural-yayinci`.
3. **Select principals:** Attribute name `repository_id`, Attribute value `1243970101` → **Save**.
4. "Configure your application" penceresi açılırsa **Dismiss** (dosya indirme; gerekmiyor).

Aynı işlem tek komutla (Cloud Shell, sağ üstteki `>_` simgesi; `PROJE_NO` yerine 2.1'deki numara):

```bash
gcloud iam service-accounts add-iam-policy-binding kural-yayinci@bozkurtacademy-8ab85.iam.gserviceaccount.com --project=bozkurtacademy-8ab85 --role=roles/iam.workloadIdentityUser --member="principalSet://iam.googleapis.com/projects/PROJE_NO/locations/global/workloadIdentityPools/github/attribute.repository_id/1243970101"
```

### Adım 3: GitHub

Depo → **Settings**.

**3.1 Ortam (Environment).** Solda **Environments** → **New environment** → ad `production` → **Configure environment**:

1. **Deployment branches and tags:** `No restriction` yerine **Selected branches and tags** → **Add deployment branch or tag rule** → `main` → **Add rule**.
2. (İsteğe bağlı) **Required reviewers:** kendini eklersen her yayın senin "Approve" demeni bekler. Gerekmiyor; korumalar zaten var.
3. **Environment secrets** → **Add environment secret**:
   - `CLOUDFLARE_API_TOKEN` = Adım 1'deki token
   - `CLOUDFLARE_ACCOUNT_ID` = Adım 1.10'daki Account ID
4. **Environment variables** → **Add environment variable** (gizli değil):
   - `GCP_WIF_PROVIDER` = `projects/PROJE_NO/locations/global/workloadIdentityPools/github/providers/github-actions`
   - `GCP_SERVICE_ACCOUNT` = `kural-yayinci@bozkurtacademy-8ab85.iam.gserviceaccount.com`

**3.2 Çatallardan gelen PR'lar.** Solda **Actions** → **General** → **Fork pull request workflows from outside collaborators** → **Require approval for all external contributors** → **Save**. (Bu workflow PR'larda zaten çalışmıyor; bu genel bir ek önlem.)

**3.3 Otomatik yayın anahtarı: şimdilik ekleme.** `OTOMATIK_YAYIN` değişkenini ilk elle yayın başarılı olduktan sonra Adım 6'da ekleyeceksin.

### Adım 4: İlk elle çalıştırma: sadece kontrol

1. Bu PR birleştikten sonra: depo → **Actions** → solda **Otomatik yayın (Worker ve Firestore kuralları)** → sağda **Run workflow**.
2. **Branch:** `main`, **Ne yayınlansın?** `ikisi`, **mod** `kontrol` → **Run workflow**.
3. Bu çalıştırma **hiçbir şeyi değiştirmez**: testleri çalıştırır, canlı Worker ayarlarının fotoğrafını çeker, kuralları okur.
4. Beklenen sonuç: **worker** işi büyük ihtimalle "Ayar fotoğrafı" adımında **kırmızı** olur, çünkü `worker/wrangler.jsonc` içindeki uyumluluk tarihi (`compatibility_date`) ve log örnekleme oranı tahminî yazıldı. İşin **Summary** sayfasında "Worker yayını yapılmadı" başlığı altında paneldeki değerler hazır bir blok olarak yazar.
5. O bloğu bana gönder (ya da sohbette "fotoğraftaki değerleri koy" de). Ben `worker/wrangler.jsonc`'a koyup küçük bir PR açarım; sen birleştirirsin.
6. **rules** işi yeşil olmalı ve canlı kuralların depodakiyle "AYNI" ya da "FARKLI" olduğunu yazar. Kırmızıysa hata mesajını bana gönder (çoğunlukla Adım 2'de bir yazım farkıdır).

### Adım 5: İlk gerçek yayın (elle)

1. Düzeltme PR'ı birleştikten sonra Adım 4'ü tekrarla (`kontrol`): iki iş de yeşil olmalı.
2. Sonra yine **Run workflow**: `ikisi`, mod **`yayinla`**.
3. Worker işi: fotoğraf → `wrangler deploy` → yayın sonrası ayar kontrolü → canlı kontrol. Hepsi yeşilse yeni kod canlıda ve bütün değişkenler, secret'lar, "AI" bağlantısı ve log ayarı yerinde. **Bu yayın, henüz yapıştırılmamış telc C1 Worker güncellemesini de getirir.**
4. Kurallar işi: canlı kurallar depodakiyle aynıysa "yeni sürüm oluşturulmadı" der; farklıysa yayınlar ve doğrular.
5. Kendin de bak: Cloudflare → Workers & Pages → schreiben-kontrol → **Deployments**: en üstte "GitHub Actions <commit>" mesajlı sürüm. **Settings → Variables and Secrets**: 7 değişken + 2 secret yerinde. Sitede bir Schreiben görevinde yapay zekâ kontrolü çalışıyor.

### Adım 6: Otomatik yayını aç

Depo → **Settings** → **Secrets and variables** → **Actions** → **Variables** sekmesi → **Repository variables** → **New repository variable**: Name `OTOMATIK_YAYIN`, Value `acik` → **Add variable**.

Bundan sonra `worker/` ya da `firestore.rules` değiştiren her PR birleşince yayın kendiliğinden yapılır. Değişiklik yoksa iş sadece testleri çalıştırır.

---

## Her PR'da ne olur?

- PR açıkken: mevcut CI (`firestore-rules.yml`) testleri, `npm run test:deploy`'u ve `wrangler deploy --dry-run`'ı çalıştırır (secret kullanılmaz, yayın yok). `keep_vars` ya da "AI" bağlantısı dosyadan yanlışlıkla silinirse PR kırmızı olur.
- Birleşince: `deploy.yml` testleri yeniden çalıştırır, sonra sadece değişen kısmı yayınlar.
- Panelde yeni bir ayar değiştirirsen (ör. log ayarı ya da uyumluluk tarihi), bir sonraki yayın **yayın yapmadan** durur ve yeni değeri yazar. O değeri `worker/wrangler.jsonc`'a koymak yeterli.
- Panelde yeni bir **değişken** ya da **secret** eklemek serbesttir; korunur. Yeni bir **bağlantı** (KV, D1 vb.) eklersen önce `worker/wrangler.jsonc`'a da eklenmeli; yoksa yayın durur.

## Geri alma

**Worker** (iş kırmızıysa Summary sayfasında da yazar):

1. Cloudflare → Workers & Pages → **schreiben-kontrol** → **Deployments** → bir önceki sürümün yanındaki **⋯** → **Rollback** → onayla. Eski sürüm, kendi ayarlarıyla birlikte birkaç saniyede canlıya döner.
2. **Settings → Variables and Secrets** ve **Bindings**: 7 değişken, AI_PASSWORD, BREVO_API_KEY ve "AI" bağlantısı yerinde mi bak. Eksik varsa yeniden ekle (docs/yapay-zeka-kurulum.md, docs/odev-eposta-kurulum.md).
3. **Settings → Observability**: Logs açık, "Include invocation logs" ve "Persist logs to the Workers dashboard" işaretli olmalı.
4. Gerekirse depo değişkeni `OTOMATIK_YAYIN`'ı sil ve hatalı PR'ı geri al (GitHub → PR → **Revert**).

**Firestore kuralları:**

- Derleme hatasıyla durduysa canlı kurallar değişmemiştir; bir şey yapman gerekmez.
- Yanlış kural yayınlandıysa: Firebase Console → **Firestore Database** → **Rules** → soldaki geçmiş listesinden bir önceki sürüm → **Publish**. Kalıcı düzeltme için hatalı PR'ı geri al; birleşince doğru kurallar yeniden yayınlanır.

**Otomatik yayını tamamen kapatmak:** `OTOMATIK_YAYIN` değişkenini sil. Erişimi geri almak için: Cloudflare → API Tokens → token → **Delete**; Google → Workload Identity Federation → `github` havuzu → **Disable** (ya da `kural-yayinci` hesabını sil).

## Sorun giderme

| Hata | Ne yapmalı |
| --- | --- |
| `CLOUDFLARE_API_TOKEN ve CLOUDFLARE_ACCOUNT_ID gerekli` | Adım 3.1: secret'lar **production** ortamında mı (depo genelinde değil)? Adları aynen mi? |
| `Cloudflare /settings → HTTP 403` ya da `Authentication error` | Token izni `Account · Workers Scripts · Edit` ve doğru hesap mı? Gerekirse token'ı yeniden oluştur. |
| `wrangler` "workers.dev subdomain" ile ilgili yetki hatası | Token'a tek bir okuma izni ekle: `Account · Account Settings · Read` (sadece okuma). |
| `google-github-actions/auth`: `Permission 'iam.serviceAccounts.getAccessToken' denied` | Adım 2.5 yapılmamış ya da değer `1243970101` değil. |
| `auth`: `The given credential is rejected by the attribute condition` | Çalıştırma `main` dalından mı? Adım 2.4.4'teki koşul aynen mi? |
| `Firebase Rules … HTTP 403` | Servis hesabının rolü **Firebase Rules Admin** mi (IAM & Admin → IAM)? |
| "Worker yayını yapılmadı: wrangler.jsonc paneldeki ayarlarla uyuşmuyor" | Hata değil, koruma. Summary'deki bloğu `worker/wrangler.jsonc`'a koy. |
| Canlı kontrol başarısız | Önce "Geri alma". `OPTIONS /check` hatası ALLOWED_ORIGINS'in silindiğini ya da değiştiğini gösterir. |

## Elle yayın (yedek yol)

Otomatik yayın çalışmazsa eski yol aynen geçerli:

- **Worker:** Cloudflare → Workers & Pages → schreiben-kontrol → **Edit code** → `worker/schreiben-kontrol.js`'in tamamını yapıştır → **Deploy** (docs/yapay-zeka-kurulum.md, Adım 1). Panel değişkenleri ve secret'lar bu yolla da korunur.
- **Kurallar:** Firebase Console → Firestore Database → **Rules** → `firestore.rules`'un tamamını yapıştır → **Publish**.
- Elle yayından sonra otomatik yayın da sorunsuz çalışır. Elle yayın aynı kodu yükler; ayar fotoğrafı bir sonraki yayında yine karşılaştırır.

## Dosyalar

- `.github/workflows/deploy.yml`: yayın işi
- `worker/wrangler.jsonc`: Worker ayarları (keep_vars, AI bağlantısı, log ayarı, uyumluluk tarihi)
- `scripts/worker-deploy-guard.mjs`: ayar fotoğrafı, yayın öncesi/sonrası karşılaştırma, canlı kontrol
- `scripts/deploy-rules.mjs`: kural yayını ve doğrulama (Firebase Rules API)
- `tests/deploy.test.mjs`: sahte Cloudflare/Firebase yanıtlarıyla testler (`npm run test:deploy`)
