import { HttpErrorResponse } from '@angular/common/http';

function extractBackendMessage(error: HttpErrorResponse): string {
  const payload = error.error;

  if (typeof payload === 'string') return payload;
  if (payload?.message && typeof payload.message === 'string') return payload.message;
  if (payload?.error && typeof payload.error === 'string') return payload.error;
  if (Array.isArray(payload?.details) && payload.details.length > 0)
    return (payload.details as string[]).join(', ');
  if (payload?.details && typeof payload.details === 'string') return payload.details;
  return '';
}

export function getUserFriendlyHttpError(error: HttpErrorResponse, requestUrl = ''): string {
  const backendMessage = extractBackendMessage(error).toLowerCase();
  const isLoginRequest = requestUrl.includes('/auth/login');

  if (error.status === 0) {
    return 'Impossible de contacter le serveur. Verifiez votre connexion.';
  }

  if (error.status === 400 && isLoginRequest) {
    return 'Adresse e-mail ou mot de passe incorrect.';
  }

  if (error.status === 401) {
    if (backendMessage.includes('disabled') || backendMessage.includes('desactive')) {
      return 'Compte desactive. Contactez votre administrateur.';
    }
    return isLoginRequest
      ? 'Adresse e-mail ou mot de passe incorrect.'
      : 'Session expiree. Veuillez vous reconnecter.';
  }

  if (error.status === 403) {
    if (backendMessage.includes('disabled') || backendMessage.includes('desactive')) {
      return 'Compte desactive. Contactez votre administrateur.';
    }
    return 'Acces refuse. Vous n avez pas les permissions necessaires.';
  }

  if (error.status === 404 && isLoginRequest) {
    return 'Adresse e-mail inexistante.';
  }

  if (error.status >= 500) {
    return 'Erreur serveur. Veuillez reessayer plus tard.';
  }

  return extractBackendMessage(error) || 'Une erreur inattendue est survenue.';
}
