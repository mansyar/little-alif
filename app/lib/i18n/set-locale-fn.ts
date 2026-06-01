import { createServerFn } from '@tanstack/react-start';
import { setCookie } from '@tanstack/react-start/server';
import { z } from 'zod';

const YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

export const setLocaleCookie = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      locale: z.enum(['en', 'id']),
    }),
  )
  .handler(({ data }) => {
    setCookie('locale', data.locale, {
      maxAge: YEAR_IN_SECONDS,
      path: '/',
      sameSite: 'lax',
    });
    return { success: true };
  });
