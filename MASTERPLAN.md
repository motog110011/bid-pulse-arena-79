# Subastas GAP — Masterplan

## Estado general: MVP en progreso

---

## Infraestructura

- [x] Proyecto Supabase: `khvmkhlwyhjjdhglrrpu`
- [x] Variables de entorno via `import.meta.env` (Vercel)
- [x] Schema SQL base (`migration.sql`)
- [x] Funciones auxiliares (`supabase/seed.sql`)
- [x] Usuario admin creado (`supabase/make_admin.sql`)
- [x] Bucket `product-images` configurado en Storage
- [x] Bucket `comprobantes` para pruebas de pago
- [x] Fix routing SPA en Vercel (`vercel.json`)
- [ ] Email confirmation template activo en Supabase Dashboard
- [ ] Deshabilitar email confirmation en dev (Auth Settings)

---

## Catalogo de productos

- [x] 20 subastas de prueba generales (`supabase/seed.sql`)
- [x] 50 subastas de licores con fotos Unsplash (`supabase/catalogo_licores.sql`) — **pendiente ejecutar en SQL Editor**
- [ ] Fotos individuales por producto subidas via admin panel
- [ ] Catálogo de perfumes extendido
- [ ] Catálogo de navajas/herramientas extendido

---

## Frontend

- [x] Identidad visual: paleta guinda/dorado (no impersona gobierno)
- [x] Header sticky con barra institucional
- [x] Menú hamburguesa mobile con animación
- [x] Hero con overlay y texto visible
- [x] AuthDialog con inputs visibles (fondo muted)
- [x] AuctionCard mobile-first (aspect-ratio, line-clamp, h-12 botón)
- [x] AuctionGrid con skeleton loaders
- [x] HowItWorks rediseñado
- [x] Footer con datos de contacto reales
- [x] Code splitting (React.lazy + Suspense) en todas las rutas
- [x] Ruta `/admin` con guard de rol
- [x] WalletRechargeForm 2 pasos: monto → referencia 5 dígitos + comprobante
- [ ] Página de perfil de usuario (`/perfil`)
- [ ] Página de mis pujas (`/mis-pujas`) con historial real
- [ ] Filtro por categoría en AuctionGrid
- [ ] Buscador de subastas
- [ ] Countdown timer en AuctionCard
- [ ] Toast/notificación cuando te superan en puja

---

## Panel Admin

- [x] AdminPanelModal montado en `/admin`
- [ ] Datos bancarios configurables desde admin (para WalletRechargeForm)
- [ ] Aprobar/rechazar solicitudes de recarga con comprobante
- [ ] Ver comprobantes subidos (bucket `comprobantes`)
- [ ] Subir fotos de productos al bucket `product-images`
- [ ] Crear/editar subastas desde admin
- [ ] Programar subastas futuras

---

## Dominio y comunicaciones

- [x] Dominio: `subastasgap.com.mx` en todo el código
- [x] Template HTML para email de confirmación (`supabase/email_confirm.html`)
- [ ] Configurar template en Supabase Dashboard (Email Templates)
- [ ] Configurar SMTP personalizado (evitar límite de 3 emails/hora de Supabase)
- [ ] Email de notificación cuando te superan en puja
- [ ] Email de confirmación cuando ganas una subasta

---

## Seguridad y compliance

- [ ] Eliminar `src/lib/supabaseAdmin.ts` (expone service_role key en cliente)
- [ ] Revisar RLS policies en todas las tablas
- [ ] Política de privacidad (`/privacidad`)
- [ ] Términos y condiciones (`/terminos`)
- [ ] Política de reembolsos (`/reembolsos`)
- [ ] FAQ (`/faq`)
- [ ] Página de contacto (`/contacto`)

---

## Notas técnicas

- Stack: React 18 + TypeScript + Vite (SWC) + Tailwind v3 + shadcn/ui + TanStack Query v5 + React Router v6 + Supabase
- Admin email: `motog110011@gmail.com`
- Soporte: `soporte@subastasgap.com.mx`
- Contacto: `contacto@subastasgap.com.mx`
