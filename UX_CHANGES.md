# UX Changes — Auditoría Mobile-First

Fecha: 2026-05-25 | Stack: React 18 + Tailwind v3 + shadcn/ui + Supabase

---

## 1. Performance — `src/index.css`

- **font-display: swap** en el import de Google Fonts para Montserrat. Evita el
  flash de texto invisible (FOIT) en conexiones lentas.
- **`prefers-reduced-motion`** — bloque `@media` que desactiva todas las
  animaciones y transiciones para usuarios con esa preferencia del sistema.
- **`scroll-margin-top`** con variable `--header-height: 6rem` en todos los
  elementos con `id`. Compensa la altura del header sticky al navegar con
  anclas (#section-id), evitando que el header tape el inicio de la sección.
- **Focus ring accesible** con `outline: 2px solid hsl(var(--ring))`
  en `:focus-visible`. No bloquea el estilo sin reemplazo.

---

## 2. Code Splitting — `src/App.tsx`

- `React.lazy` + `Suspense` en todas las rutas secundarias (`/perfil`,
  `/terminos`, `/faq`, `/privacidad`, `/reembolsos`, `/contacto`,
  `/mis-pujas`, `/admin`, `/404`).
- `Index` y `Auth` se mantienen eager-loaded (critical path / above the fold).
- Fallback: spinner guinda centrado sin layout shift.
- Reducción estimada del bundle inicial: ~35–45%.

---

## 3. Navegación — `src/components/Header.tsx`

- **Menú hamburguesa mobile** con animación Menu ↔ X mediante clases
  Tailwind `opacity/rotate/scale` + `transition-all duration-200`.
  Sin dependencias extra.
- **Slide-in del menú** mediante `max-h-0 → max-h-[32rem]` con `transition-all
  duration-300 ease-in-out`. Evita `display:none` que no permite animación.
- **`aria-expanded`** y **`aria-controls`** en el botón hamburguesa.
  **`aria-hidden`** en el panel cuando está cerrado.
- Todos los ítems del menú mobile tienen `min-h-[48px]` (touch target).
- Saldo del usuario visible en mobile dentro del menú abierto.
- El menú se cierra al navegar a una ruta o al hacer scroll a una sección.
- En desktop todos los botones de nav tienen `min-h-[44px]`.
- **Admin** enlaza a `/admin` (ruta) en lugar de abrir modal — acceso directo
  desde el menú mobile.

---

## 4. Cards — `src/components/ui/auction-card.tsx`

- **`aspect-[4/3]`** en el contenedor de imagen. Reserva espacio antes de
  que cargue — elimina layout shift (CLS).
- **`line-clamp-2`** en el título. Limita a 2 líneas, evita desbordamiento
  y mantiene altura consistente entre cards.
- **`flex flex-col flex-1`** en `CardContent`. Cards de distinta altura de
  texto se alinean correctamente en grid.
- **Controles de puja al fondo** (thumb zone en mobile — parte inferior de la
  pantalla, accesible con el pulgar).
- **`h-12` (48px) en el botón "Realizar Oferta"**. Área de toque mínima.
- **`inputMode="numeric"`** en el input de monto. Abre teclado numérico en
  iOS/Android sin cambiar el tipo de input.
- **`text-base`** (16px) en el input. Previene zoom automático de iOS.
- Eliminado `group-hover:scale-105` en imagen (causaba micro layout shift).
- `aria-label` en el input de oferta para lectores de pantalla.
- `aria-hidden="true"` en todos los iconos decorativos de Lucide.

---

## 5. Grid de subastas — `src/components/AuctionGrid.tsx`

- Grid mobile-first: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`.
  Una columna en mobile, 2 en tablet, 3 en desktop.
- **Skeleton loader con `aspect-[4/3]`** que coincide con la imagen real.
  Elimina layout shift al cargar las cards.
- Gap responsivo: `gap-4 sm:gap-6`.

---

## 6. Formularios — `src/pages/Auth.tsx`

- **`text-base h-12`** en todos los inputs (email, password, nombre).
  16px previene zoom en iOS; 48px de alto mejora la usabilidad táctil.
- **`autoComplete`** correcto en cada campo (`email`, `current-password`,
  `new-password`, `name`). Activa el autocompletado del sistema.
- **`inputMode="email"`** en campos de email.
- **`h-12 text-base`** en botones de submit.

---

## 7. Formularios — `src/components/WalletRechargeForm.tsx`

- **`inputMode="numeric"`** en el campo de monto. Teclado numérico en mobile.
- **`text-base h-12`** en inputs de monto y contacto.
- **`type="tel"` + `inputMode="tel"`** en el campo de teléfono.
- **`autoComplete="email"`** y `autoComplete="tel"` según el campo activo.
- Botón submit con `h-12 text-base`.

---

## 8. Sección "Cómo Funciona" — `src/components/HowItWorks.tsx`

- Eliminados `backdrop-blur-sm` y clases de glassmorphism (remante del tema oscuro).
- Layout mobile-first con `flex-col sm:flex-row` en cada paso.
- Pasos convertidos a `<ol>` semántico (lista ordenada) para accesibilidad.
- Conector vertical entre pasos solo visible en `sm+` (sin contaminar mobile).
- `min-h-[48px]` en el botón CTA.
- Cards de features: `bg-white border border-border` sin glassmorphism.
- `aria-hidden="true"` en todos los iconos.

---

## 9. Accesibilidad general

| Elemento | Antes | Después |
|----------|-------|---------|
| Botones icon-only | sin aria-label | `aria-label` descriptivo |
| Iconos decorativos | sin aria-hidden | `aria-hidden="true"` |
| Menú mobile | sin roles ARIA | `aria-expanded`, `aria-controls`, `aria-hidden` |
| Focus ring | potencialmente sobreescrito | `:focus-visible` explícito en CSS global |
| Touch targets | variables | `min-h-[44px]` desktop, `min-h-[48px]` mobile |

---

## Breakpoints verificados (Tailwind v3)

| Breakpoint | Clases usadas | Comportamiento |
|-----------|---------------|----------------|
| Mobile < 640px | base | 1 col grid, menú hamburguesa, inputs full-width |
| Tablet 640–1024px | `sm:` | 2 col grid, barra institucional completa |
| Desktop > 1024px | `lg:` | 3 col grid, nav horizontal, hero 2 columnas |
