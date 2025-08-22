import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, BaseRouteReuseStrategy, DetachedRouteHandle } from "@angular/router";
import { Logger, LOGGER } from "../services";


export class StepReuseStrategy extends BaseRouteReuseStrategy {
  private logger = inject<Logger>(LOGGER);
  private storedRoutes = new Map<string, DetachedRouteHandle>();

  constructor() {
    super();
    this.logger.workflow('Route reuse strategy initialized');
  }

  override shouldDetach(route: ActivatedRouteSnapshot): boolean { 
    this.logger.log(`Detaching route: ${route.routeConfig?.path}`);
    return true;
  }
  
  override store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
    const key = this.getRouteKey(route);
    this.storedRoutes.set(key, handle);
    this.logger.log(`Stored route: ${key}`, handle);
  }
  
  override shouldAttach(route: ActivatedRouteSnapshot): boolean { 
    const shouldAttach = this.storedRoutes.has(this.getRouteKey(route));
    this.logger.log(`Should attach route: ${shouldAttach}`);
    return shouldAttach;
  }
  
  override retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    const key = this.getRouteKey(route);
    this.logger.log(`Retrieved route: ${key}`);
    return this.storedRoutes.get(key) || null;
  }
  
  override shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    const shouldReuse = super.shouldReuseRoute(future, curr);
    this.logger.log(`Should reuse route: ${shouldReuse}`);
    return shouldReuse;
  }

  private getRouteKey(route: ActivatedRouteSnapshot): string {
    const key = route.routeConfig?.path || route.url.join('/');
    this.logger.log(`Route key: ${key}`);
    return key;
  }
}



