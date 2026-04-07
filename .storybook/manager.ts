interface UnknownPopoverProps {
  ariaLabel?: string;
  [key: string]: unknown;
}

type PopoverProviderComponent = (props: UnknownPopoverProps) => unknown;

interface StorybookComponentsGlobal {
  PopoverProvider?: PopoverProviderComponent;
}

type StorybookGlobal = typeof globalThis & {
  __STORYBOOK_COMPONENTS__?: StorybookComponentsGlobal;
};

const storybookGlobal = globalThis as StorybookGlobal;
const components = storybookGlobal.__STORYBOOK_COMPONENTS__;

if (components?.PopoverProvider) {
  const OriginalPopoverProvider = components.PopoverProvider;

  components.PopoverProvider = (props: UnknownPopoverProps) => {
    const ariaLabel =
      typeof props.ariaLabel === 'string' && props.ariaLabel.trim().length > 0
        ? props.ariaLabel
        : 'Storybook contextual popover';

    return OriginalPopoverProvider({
      ...props,
      ariaLabel,
    });
  };
}
