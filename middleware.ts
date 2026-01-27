import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // 1. On vérifie si l'utilisateur envoie des identifiants
  const authHeader = request.headers.get('authorization')

  if (authHeader) {
    // 2. On décode l'identifiant et le mot de passe (encodés en base64)
    const authValue = authHeader.split(' ')[1]
    const [user, pwd] = atob(authValue).split(':')

    // 3. On vérifie si c'est les bons identifiants
    if (user === 'webdoc' && pwd === 'MMIS3') {
      // C'est bon, on laisse passer
      return NextResponse.next()
    }
  }

  // 4. Si pas connecté ou mauvais mot de passe, on bloque et on demande l'auth
  return new NextResponse('Authentification requise', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Espace Securise Webdoc"',
    },
  })
}

// On applique cette sécurité sur tout le site
export const config = {
  matcher: '/:path*',
}