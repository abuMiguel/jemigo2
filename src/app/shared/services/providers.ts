import { IMAGE_CONFIG, IMAGE_LOADER, ImageLoaderConfig } from "@angular/common";

export const imageLoaderConfig = [{
    provide: IMAGE_CONFIG,
    useValue: {
      breakpoints: [400, 640]
    }
  },
  {
    provide: IMAGE_LOADER,
    useValue: (config: ImageLoaderConfig) => {
      if (config.width) {
        const src = config.src.split(".");
        return `${src[0]}-${config.width}w.${src[1]}`;
      }
      else {
        const src = config.src.split(".");
        return `${src[0]}-400w.${src[1]}`;
      }
    },
  },];