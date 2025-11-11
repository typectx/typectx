import type { ReactNode } from "react"
import styles from "./styles.module.css"

export default function SectionSeparator(): ReactNode {
    return (
        <div className={styles.separator}>
            <div className={styles.line} />
            <div className={styles.logoContainer}>
                <img
                    src="img/typectx-logo.png"
                    alt="typectx Logo"
                    className={styles.logo}
                />
            </div>
            <div className={styles.line} />
        </div>
    )
}
