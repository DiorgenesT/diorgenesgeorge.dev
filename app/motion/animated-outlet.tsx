import * as motion from "motion/react-client";
import type { ReactNode } from "react";

export default function AnimatedOutlet({
  routeKey,
  entry,
  children,
}: {
  routeKey: string;
  /** Falso na primeira carga: animar a entrada esconderia o conteúdo recém-pintado. */
  entry: boolean;
  children: ReactNode;
}) {
  return (
    <motion.div
      key={routeKey}
      initial={entry ? { opacity: 0, y: 8 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
