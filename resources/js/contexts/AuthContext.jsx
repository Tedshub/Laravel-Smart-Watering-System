// resources/js/hooks/useAuth.js
import { usePage } from '@inertiajs/inertia-react';

export default function useAuth() {
  return usePage().props.auth;
}
