import { describe, it, expect, vi } from "vitest"
import { $$App } from "@/components/app"
import { render, screen, waitFor } from "@testing-library/react"
import { QueryClientProvider } from "@tanstack/react-query"
import { queryClient } from "@/query"
import { StrictMode } from "react"
import { createMarket } from "typectx"
import { use$ } from "../../../@typectx/react/dist"

describe("React Client", () => {
    it("should be able to render the app", async () => {
        const App = $$App.assemble({}).unpack()

        function Test() {
            return <p>Test</p>
        }

        const test = <Test />
        expect(App).toBeDefined()
        render(
            <StrictMode>
                <QueryClientProvider client={queryClient}>
                    <App defaultUserId="userA" />
                </QueryClientProvider>
            </StrictMode>
        )
        expect(screen.getByText("Loading default user...")).toBeInTheDocument()

        await waitFor(() => {
            expect(
                screen.getByText("Social Feed Wireframe")
            ).toBeInTheDocument()
        })
    })

    it("should not rerender stateful client components on reassembly", () => {
        const market = createMarket()
        // create a vitest spy
        const spyA = vi.fn()
        const spyB = vi.fn()
        const $$ComponentA = market.offer("ComponentA").asProduct({
            factory: (init$) => {
                spyA()
                return () => {
                    const $ = use$(init$)
                    spyB()
                    return <div>ComponentA</div>
                }
            }
        })
        const $$ComponentB = market.offer("ComponentB").asProduct({
            suppliers: [$$ComponentA],
            factory: (init$, $$) => () => {
                const $ = use$(init$)
                $$($$ComponentA).assemble({}).unpack()
                $$($$ComponentA).assemble({}).unpack()
                $$($$ComponentA).assemble({}).unpack()
                const ComponentA = $$($$ComponentA).assemble({}).unpack()
                return (
                    <div>
                        <p>ComponentB</p>
                        <ComponentA />
                    </div>
                )
            }
        })

        $$ComponentB.assemble({}).unpack()
        expect(spyA).toHaveBeenCalledTimes(1)
        expect(spyB).toHaveBeenCalledTimes(4)
    })
})
