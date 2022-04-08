# datdot-ui-datepicker
DatDot UI component

Opts
---
`{name = 'datepicker', month1, month2, status = 'cleared'}`


Incomming message types
---

- `value/first`
- `value/second`
- `selecting/second`
- `cleared`

Outgoing message types
---

**parent**
- `ready`
- `value-first`
- `value-second`
- `color-from-start`
- `color-to-end`

**calendar days**
- `change`
- `clear`

**all recipients**
- `first-selected-by-startcal`
- `first-selected-by-endcal`