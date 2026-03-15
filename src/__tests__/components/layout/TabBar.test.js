import { jsx as _jsx } from "react/jsx-runtime";
import { render, screen, fireEvent } from '@testing-library/react';
import { TabBar } from '../../../components/layout/TabBar';
import { useRequestStore } from '../../../store/requestStore';
beforeEach(() => {
    useRequestStore.setState({ tabs: [], activeTabId: null });
    useRequestStore.getState().addTab();
});
describe('TabBar', () => {
    describe('Rendering', () => {
        it('renders at least one tab', () => {
            render(_jsx(TabBar, {}));
            // Each tab has a close button — at least one should exist
            const closeBtns = screen.getAllByRole('button', { name: /close tab/i });
            expect(closeBtns.length).toBeGreaterThanOrEqual(1);
        });
        it('renders tab name "New Request"', () => {
            render(_jsx(TabBar, {}));
            expect(screen.getByText('New Request')).toBeInTheDocument();
        });
        it('renders method badge on each tab', () => {
            render(_jsx(TabBar, {}));
            // Default method is GET
            expect(screen.getByText('GET')).toBeInTheDocument();
        });
        it('renders "+" new tab button with aria-label="New tab"', () => {
            render(_jsx(TabBar, {}));
            expect(screen.getByRole('button', { name: /new tab/i })).toBeInTheDocument();
        });
        it('renders close button on each tab with aria-label="Close tab"', () => {
            render(_jsx(TabBar, {}));
            const closeBtns = screen.getAllByRole('button', { name: /close tab/i });
            expect(closeBtns.length).toBeGreaterThanOrEqual(1);
        });
    });
    describe('Active tab styling', () => {
        it('active tab has border-b-2 class', () => {
            render(_jsx(TabBar, {}));
            const { tabs, activeTabId } = useRequestStore.getState();
            const activeTab = tabs.find((t) => t.id === activeTabId);
            // Find the tab container by its text content
            const tabLabel = screen.getByText(activeTab.name);
            const tabContainer = tabLabel.closest('[class*="border-b-2"]');
            expect(tabContainer).not.toBeNull();
            expect(tabContainer).toHaveClass('border-b-2');
        });
        it('inactive tab does not have border-b-2 class', () => {
            // Add a second tab so one is inactive
            useRequestStore.getState().addTab();
            // The first tab is now inactive (second tab is active after addTab)
            render(_jsx(TabBar, {}));
            const { tabs, activeTabId } = useRequestStore.getState();
            const inactiveTab = tabs.find((t) => t.id !== activeTabId);
            if (!inactiveTab)
                return; // safety guard
            const tabLabels = screen.getAllByText('New Request');
            // At least one tab label should be in a container without border-b-2
            const inactiveEl = tabLabels.find((el) => {
                const container = el.closest('div[class]');
                return container && !container.className.includes('border-b-2');
            });
            expect(inactiveEl).toBeTruthy();
        });
    });
    describe('Interactions', () => {
        it('clicking "+" adds a new tab', () => {
            render(_jsx(TabBar, {}));
            const addBtn = screen.getByRole('button', { name: /new tab/i });
            fireEvent.click(addBtn);
            // Now there should be 2 close buttons
            const closeBtns = screen.getAllByRole('button', { name: /close tab/i });
            expect(closeBtns.length).toBe(2);
        });
        it("clicking a tab makes it active (store's activeTabId changes)", () => {
            // Start with one tab, add another so the first is inactive
            useRequestStore.getState().addTab();
            const stateBeforeRender = useRequestStore.getState();
            const firstTab = stateBeforeRender.tabs[0];
            render(_jsx(TabBar, {}));
            // The second tab added by addTab() is active; click the first tab's area
            // Tab containers are divs with onClick; we can target by tab text index
            const tabLabels = screen.getAllByText('New Request');
            fireEvent.click(tabLabels[0]);
            const { activeTabId } = useRequestStore.getState();
            expect(activeTabId).toBe(firstTab.id);
        });
        it('clicking close button removes the tab', () => {
            // Add a second tab first so we can close one without triggering the "last tab" refresh
            useRequestStore.getState().addTab();
            render(_jsx(TabBar, {}));
            const closeBtns = screen.getAllByRole('button', { name: /close tab/i });
            expect(closeBtns.length).toBe(2);
            fireEvent.click(closeBtns[0]);
            const closeBtnsAfter = screen.getAllByRole('button', { name: /close tab/i });
            expect(closeBtnsAfter.length).toBe(1);
        });
        it('closing the last tab results in a new fresh tab being created (tabs.length stays 1)', () => {
            render(_jsx(TabBar, {}));
            const closeBtn = screen.getByRole('button', { name: /close tab/i });
            fireEvent.click(closeBtn);
            // After closing the last tab, the store creates a new one — still 1 close button
            const closeBtnsAfter = screen.getAllByRole('button', { name: /close tab/i });
            expect(closeBtnsAfter.length).toBe(1);
            const { tabs } = useRequestStore.getState();
            expect(tabs).toHaveLength(1);
        });
    });
});
