import { ApplicationConfig, provideZonelessChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { LucideAngularModule, User, Lock, Eye, EyeOff, LogIn, LayoutDashboard, Users, MessageSquare, RefreshCw, UserPlus, Phone, ListChecks, ShoppingCart, Clock, AlertTriangle, Search, Smartphone, MapPin, Hash, PieChart, Database, Building2, LogOut, CheckCircle, HelpCircle, TrendingUp, ToggleLeft, ToggleRight, Trash2, Activity, Zap, LifeBuoy } from 'lucide-angular';

import { routes } from './app.routes';
import { tokenInterceptor } from './core/interceptors/token.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([tokenInterceptor])
    ),
    importProvidersFrom(
      LucideAngularModule.pick({ 
        User, Lock, Eye, EyeOff, LogIn, LayoutDashboard, 
        Users, MessageSquare, RefreshCw, UserPlus, Phone, 
        ListChecks, ShoppingCart, Clock, AlertTriangle, Search,
        Smartphone, MapPin, Hash, PieChart, Database, Building2,
        LogOut, CheckCircle, HelpCircle, TrendingUp, ToggleLeft, ToggleRight, Trash2,
        Activity, Zap, LifeBuoy
      })
    )
  ]
};
