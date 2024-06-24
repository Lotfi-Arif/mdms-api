import { Module, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { FirebaseService } from './firebase.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

const logger = new Logger('FirebaseModule');

const firebaseProvider = {
  provide: 'FIREBASE_ADMIN',
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const firebaseConfig = {
      type: configService.get<string>('TYPE'),
      projectId: configService.get<string>('PROJECT_ID'),
      privateKeyId: configService.get<string>('PRIVATE_KEY_ID'),
      privateKey: configService.get<string>('PRIVATE_KEY'),
      clientEmail: configService.get<string>('CLIENT_EMAIL'),
      clientId: configService.get<string>('CLIENT_ID'),
      authUri: configService.get<string>('AUTH_URI'),
      tokenUri: configService.get<string>('TOKEN_URI'),
      authProviderX509CertUrl: configService.get<string>('AUTH_CERT_URL'),
      clientC509CertUrl: configService.get<string>('CLIENT_CERT_URL'),
      universeDomain: configService.get<string>('UNIVERSAL_DOMAIN'),
    };

    logger.log(`Firebase Config: ${JSON.stringify(firebaseConfig)}`);

    if (!firebaseConfig.privateKey) {
      logger.error('Firebase private key is missing');
      throw new Error('Firebase private key is missing');
    }

    return admin.initializeApp({
      credential: admin.credential.cert({
        projectId: firebaseConfig.projectId,
        clientEmail: firebaseConfig.clientEmail,
        privateKey: firebaseConfig.privateKey.replace(/\\n/g, '\n'),
      }),
      databaseURL: `https://${firebaseConfig.projectId}.firebaseio.com`,
      storageBucket: `${firebaseConfig.projectId}.appspot.com`,
    });
  },
};

@Module({
  imports: [ConfigModule],
  providers: [firebaseProvider, FirebaseService],
  exports: [FirebaseService],
})
export class FirebaseModule {}
