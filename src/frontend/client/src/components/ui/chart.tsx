import * as React from "react";
import * as RechartsPrimitive from "recharts";

import { cn } from "@/lib/utils";

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: "", dark: ".dark" } as const;

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  );
};

type ChartContextProps = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }

  return context;
}

function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig;
  children: React.ComponentProps<
    typeof RechartsPrimitive.ResponsiveContainer
  >["children"];
}) {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        data-chart={chartId}
        className={cn(
          "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border flex aspect-video justify-center text-xs [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-sector]:outline-hidden [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-surface]:outline-hidden",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([, config]) => config.theme || config.color
  );

  if (!colorConfig.length) {
    return null;
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color =
      itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ||
      itemConfig.color;
    return color ? `  --color-${key}: ${color};` : null;
  })
  .join("\n")}
}
`
          )
          .join("\n"),
      }}
    />
  );
};

const ChartTooltip = RechartsPrimitive.Tooltip;

type TooltipPayload = NonNullable<
  React.ComponentProps<typeof RechartsPrimitive.Tooltip>["payload"]
>[number];

type TooltipFormatter = NonNullable<
  React.ComponentProps<typeof RechartsPrimitive.Tooltip>["formatter"]
>;

type FormattableTooltipPayload = TooltipPayload & {
  value: NonNullable<TooltipPayload["value"]>;
  name: NonNullable<TooltipPayload["name"]>;
};

function getTooltipLabelKey(
  item: TooltipPayload | undefined,
  labelKey: string | undefined
) {
  return `${labelKey || item?.dataKey || item?.name || "value"}`;
}

function getTooltipLabelValue({
  config,
  itemConfig,
  label,
  labelKey,
}: {
  config: ChartConfig;
  itemConfig: ChartConfig[string] | undefined;
  label: unknown;
  labelKey: string | undefined;
}) {
  if (!labelKey && typeof label === "string") {
    return config[label as keyof typeof config]?.label || label;
  }

  return itemConfig?.label;
}

function renderTooltipLabel(
  value: React.ReactNode,
  className: string | undefined,
  labelFormatter:
    | React.ComponentProps<typeof RechartsPrimitive.Tooltip>["labelFormatter"]
    | undefined,
  payload: NonNullable<
    React.ComponentProps<typeof RechartsPrimitive.Tooltip>["payload"]
  >
) {
  if (labelFormatter) {
    return (
      <div className={cn("font-medium", className)}>
        {labelFormatter(value, payload)}
      </div>
    );
  }

  return value ? <div className={cn("font-medium", className)}>{value}</div> : null;
}

function useTooltipLabel({
  config,
  hideLabel,
  payload,
  labelKey,
  label,
  labelFormatter,
  labelClassName,
}: {
  config: ChartConfig;
  hideLabel: boolean;
  payload: React.ComponentProps<typeof RechartsPrimitive.Tooltip>["payload"];
  labelKey: string | undefined;
  label: unknown;
  labelFormatter: React.ComponentProps<
    typeof RechartsPrimitive.Tooltip
  >["labelFormatter"];
  labelClassName: string | undefined;
}) {
  return React.useMemo(() => {
    if (hideLabel || !payload?.length) return null;

    const [item] = payload;
    const key = getTooltipLabelKey(item, labelKey);
    const itemConfig = getPayloadConfigFromPayload(config, item, key);
    const value = getTooltipLabelValue({
      config,
      itemConfig,
      label,
      labelKey,
    });

    return renderTooltipLabel(value, labelClassName, labelFormatter, payload);
  }, [
    label,
    labelFormatter,
    payload,
    hideLabel,
    labelClassName,
    config,
    labelKey,
  ]);
}

function TooltipIndicator({
  color,
  hideIndicator,
  indicator,
  itemConfig,
  nestLabel,
}: {
  color: string | undefined;
  hideIndicator: boolean;
  indicator: "line" | "dot" | "dashed";
  itemConfig: ChartConfig[string] | undefined;
  nestLabel: boolean;
}) {
  if (itemConfig?.icon) return <itemConfig.icon />;
  if (hideIndicator) return null;

  return (
    <div
      className={cn("shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg)", {
        "h-2.5 w-2.5": indicator === "dot",
        "w-1": indicator === "line",
        "w-0 border-[1.5px] border-dashed bg-transparent": indicator === "dashed",
        "my-0.5": nestLabel && indicator === "dashed",
      })}
      style={
        {
          "--color-bg": color,
          "--color-border": color,
        } as React.CSSProperties
      }
    />
  );
}

function TooltipItemValue({ value }: { value: TooltipPayload["value"] }) {
  if (!value) return null;

  return (
    <span className="text-foreground font-mono font-medium tabular-nums">
      {value.toLocaleString()}
    </span>
  );
}

function DefaultTooltipItemContent({
  item,
  itemConfig,
  indicatorColor,
  hideIndicator,
  indicator,
  nestLabel,
  tooltipLabel,
}: {
  item: TooltipPayload;
  itemConfig: ChartConfig[string] | undefined;
  indicatorColor: string | undefined;
  hideIndicator: boolean;
  indicator: "line" | "dot" | "dashed";
  nestLabel: boolean;
  tooltipLabel: React.ReactNode;
}) {
  return (
    <>
      <TooltipIndicator
        color={indicatorColor}
        hideIndicator={hideIndicator}
        indicator={indicator}
        itemConfig={itemConfig}
        nestLabel={nestLabel}
      />
      <div
        className={cn(
          "flex flex-1 justify-between leading-none",
          nestLabel ? "items-end" : "items-center"
        )}
      >
        <div className="grid gap-1.5">
          {nestLabel ? tooltipLabel : null}
          <span className="text-muted-foreground">
            {itemConfig?.label || item.name}
          </span>
        </div>
        <TooltipItemValue value={item.value} />
      </div>
    </>
  );
}

function hasFormattableTooltipPayload(
  item: TooltipPayload
): item is FormattableTooltipPayload {
  return item.value !== undefined && Boolean(item.name);
}

function ChartTooltipItem({
  color,
  config,
  formatter,
  hideIndicator,
  index,
  indicator,
  item,
  nameKey,
  nestLabel,
  tooltipLabel,
}: {
  color: string | undefined;
  config: ChartConfig;
  formatter: TooltipFormatter | undefined;
  hideIndicator: boolean;
  index: number;
  indicator: "line" | "dot" | "dashed";
  item: TooltipPayload;
  nameKey: string | undefined;
  nestLabel: boolean;
  tooltipLabel: React.ReactNode;
}) {
  const key = `${nameKey || item.name || item.dataKey || "value"}`;
  const itemConfig = getPayloadConfigFromPayload(config, item, key);
  const indicatorColor = color || item.payload.fill || item.color;

  return (
    <div
      key={item.dataKey}
      className={cn(
        "[&>svg]:text-muted-foreground flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5",
        indicator === "dot" && "items-center"
      )}
    >
      {formatter && hasFormattableTooltipPayload(item) ? (
        formatter(item.value, item.name, item, index, item.payload)
      ) : (
        <DefaultTooltipItemContent
          item={item}
          itemConfig={itemConfig}
          indicatorColor={indicatorColor}
          hideIndicator={hideIndicator}
          indicator={indicator}
          nestLabel={nestLabel}
          tooltipLabel={tooltipLabel}
        />
      )}
    </div>
  );
}

function ChartTooltipContent({
  active,
  payload,
  className,
  indicator = "dot",
  hideLabel = false,
  hideIndicator = false,
  label,
  labelFormatter,
  labelClassName,
  formatter,
  color,
  nameKey,
  labelKey,
}: React.ComponentProps<typeof RechartsPrimitive.Tooltip> &
  React.ComponentProps<"div"> & {
    hideLabel?: boolean;
    hideIndicator?: boolean;
    indicator?: "line" | "dot" | "dashed";
    nameKey?: string;
    labelKey?: string;
  }) {
  const { config } = useChart();

  const tooltipLabel = useTooltipLabel({
    config,
    hideLabel,
    payload,
    labelKey,
    label,
    labelFormatter,
    labelClassName,
  });

  if (!active || !payload?.length) {
    return null;
  }

  const nestLabel = payload.length === 1 && indicator !== "dot";

  return (
    <div
      className={cn(
        "border-border/50 bg-background grid min-w-[8rem] items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl",
        className
      )}
    >
      {!nestLabel ? tooltipLabel : null}
      <div className="grid gap-1.5">
        {payload
          .filter(item => item.type !== "none")
          .map((item, index) => (
            <ChartTooltipItem
              key={item.dataKey}
              color={color}
              config={config}
              formatter={formatter}
              hideIndicator={hideIndicator}
              index={index}
              indicator={indicator}
              item={item}
              nameKey={nameKey}
              nestLabel={nestLabel}
              tooltipLabel={tooltipLabel}
            />
          ))}
      </div>
    </div>
  );
}

const ChartLegend = RechartsPrimitive.Legend;

function ChartLegendContent({
  className,
  hideIcon = false,
  payload,
  verticalAlign = "bottom",
  nameKey,
}: React.ComponentProps<"div"> &
  Pick<RechartsPrimitive.LegendProps, "payload" | "verticalAlign"> & {
    hideIcon?: boolean;
    nameKey?: string;
  }) {
  const { config } = useChart();

  if (!payload?.length) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-4",
        verticalAlign === "top" ? "pb-3" : "pt-3",
        className
      )}
    >
      {payload
        .filter(item => item.type !== "none")
        .map(item => {
          const key = `${nameKey || item.dataKey || "value"}`;
          const itemConfig = getPayloadConfigFromPayload(config, item, key);

          return (
            <div
              key={item.value}
              className={cn(
                "[&>svg]:text-muted-foreground flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3"
              )}
            >
              {itemConfig?.icon && !hideIcon ? (
                <itemConfig.icon />
              ) : (
                <div
                  className="h-2 w-2 shrink-0 rounded-[2px]"
                  style={{
                    backgroundColor: item.color,
                  }}
                />
              )}
              {itemConfig?.label}
            </div>
          );
        })}
    </div>
  );
}

// Helper to extract item config from a payload.
function asObject(value: unknown): Record<string, unknown> | undefined {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : undefined;
}

function getStringValue(source: Record<string, unknown> | undefined, key: string) {
  const value = source?.[key];
  return typeof value === "string" ? value : undefined;
}

function getPayloadConfigKey(payload: unknown, key: string) {
  const payloadObject = asObject(payload);
  const nestedPayload = asObject(payloadObject?.payload);

  return (
    getStringValue(payloadObject, key) ||
    getStringValue(nestedPayload, key) ||
    key
  );
}

function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: unknown,
  key: string
) {
  if (!asObject(payload)) return undefined;

  const configLabelKey = getPayloadConfigKey(payload, key);
  return configLabelKey in config
    ? config[configLabelKey]
    : config[key as keyof typeof config];
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
};
