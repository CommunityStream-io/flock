export type StepRouteData = {
  description: string;
  next?: string;
  previous?: string;
};

export type StepRoute = {
  data: StepRouteData;
}