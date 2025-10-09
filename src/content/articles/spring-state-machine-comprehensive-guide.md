---
title: "Spring State Machine: Complete Guide to Building Stateful Applications"
description: "Master Spring State Machine for managing complex workflows and state transitions. Learn states, events, transitions, actions, guards, hierarchical states, and build production-ready stateful applications."
publishDate: 2025-08-18
tags: ["Spring Boot", "State Machine", "Workflow", "Java", "FSM", "Design Patterns"]
readTime: "25 min read"
---

# Spring State Machine: Complete Guide to Building Stateful Applications

Spring State Machine is a powerful framework for managing application state and complex workflows using finite state machine concepts. In this comprehensive guide, we'll explore everything from basic state machines to advanced production patterns.

## What is a State Machine?

A **state machine** is a computational model that can be in exactly one of a finite number of states at any given time. It transitions between states in response to events.

### Real-World Analogies

```
Traffic Light State Machine:
┌─────────┐  timer   ┌─────────┐  timer   ┌─────────┐  timer
│  GREEN  │ ──────→  │ YELLOW  │ ──────→  │   RED   │ ──────→  GREEN
└─────────┘          └─────────┘          └─────────┘

Order Processing State Machine:
┌─────────┐  place   ┌─────────┐  pay     ┌─────────┐  ship
│  DRAFT  │ ──────→  │ PENDING │ ──────→  │  PAID   │ ──────→  SHIPPED
└─────────┘          └─────────┘          └─────────┘          │
                                                                 │
                                                                 ↓
                                                           ┌──────────┐
                                                           │DELIVERED │
                                                           └──────────┘
```

### Why Use State Machines?

**Problems They Solve:**
- ❌ Complex if/else logic scattered throughout code
- ❌ Invalid state transitions (e.g., shipping unpaid orders)
- ❌ Difficult to understand workflow
- ❌ Hard to maintain and extend

**Benefits:**
- ✅ Clear, visualizable state flow
- ✅ Enforced valid transitions
- ✅ Centralized state management
- ✅ Easy to test and maintain

## Getting Started

### Dependencies

```xml
<!-- pom.xml -->
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter</artifactId>
    </dependency>

    <dependency>
        <groupId>org.springframework.statemachine</groupId>
        <artifactId>spring-statemachine-starter</artifactId>
        <version>4.0.1</version>
    </dependency>

    <!-- For persistence -->
    <dependency>
        <groupId>org.springframework.statemachine</groupId>
        <artifactId>spring-statemachine-data-jpa</artifactId>
        <version>4.0.1</version>
    </dependency>
</dependencies>
```

### Basic State Machine

```java
// Define states and events
public enum States {
    DRAFT,      // Initial state
    SUBMITTED,  // Order submitted
    APPROVED,   // Order approved
    REJECTED,   // Order rejected
    COMPLETED   // Final state
}

public enum Events {
    SUBMIT,     // Submit order
    APPROVE,    // Approve order
    REJECT,     // Reject order
    COMPLETE    // Complete order
}

// Configuration
@Configuration
@EnableStateMachine
public class OrderStateMachineConfig
        extends EnumStateMachineConfigurerAdapter<States, Events> {

    @Override
    public void configure(StateMachineStateConfigurer<States, Events> states)
            throws Exception {
        states
            .withStates()
                .initial(States.DRAFT)
                .state(States.SUBMITTED)
                .state(States.APPROVED)
                .state(States.REJECTED)
                .end(States.COMPLETED);
    }

    @Override
    public void configure(StateMachineTransitionConfigurer<States, Events> transitions)
            throws Exception {
        transitions
            // DRAFT -> SUBMITTED
            .withExternal()
                .source(States.DRAFT)
                .target(States.SUBMITTED)
                .event(Events.SUBMIT)
                .and()

            // SUBMITTED -> APPROVED
            .withExternal()
                .source(States.SUBMITTED)
                .target(States.APPROVED)
                .event(Events.APPROVE)
                .and()

            // SUBMITTED -> REJECTED
            .withExternal()
                .source(States.SUBMITTED)
                .target(States.REJECTED)
                .event(Events.REJECT)
                .and()

            // APPROVED -> COMPLETED
            .withExternal()
                .source(States.APPROVED)
                .target(States.COMPLETED)
                .event(Events.COMPLETE);
    }
}

// Using the state machine
@Service
public class OrderService {

    @Autowired
    private StateMachine<States, Events> stateMachine;

    public void processOrder() {
        // Start the state machine
        stateMachine.start();

        // Current state: DRAFT
        System.out.println("Current state: " + stateMachine.getState().getId());

        // Send events
        stateMachine.sendEvent(Events.SUBMIT);
        System.out.println("After SUBMIT: " + stateMachine.getState().getId());
        // Output: SUBMITTED

        stateMachine.sendEvent(Events.APPROVE);
        System.out.println("After APPROVE: " + stateMachine.getState().getId());
        // Output: APPROVED

        stateMachine.sendEvent(Events.COMPLETE);
        System.out.println("After COMPLETE: " + stateMachine.getState().getId());
        // Output: COMPLETED

        // Stop the state machine
        stateMachine.stop();
    }
}
```

## Actions

Actions execute logic during state transitions or when entering/exiting states.

```java
@Configuration
@EnableStateMachine
public class ActionStateMachineConfig
        extends EnumStateMachineConfigurerAdapter<States, Events> {

    @Override
    public void configure(StateMachineStateConfigurer<States, Events> states)
            throws Exception {
        states
            .withStates()
                .initial(States.DRAFT)
                .state(States.SUBMITTED, submitAction(), errorAction())  // Entry and exit actions
                .state(States.APPROVED)
                .end(States.COMPLETED);
    }

    @Override
    public void configure(StateMachineTransitionConfigurer<States, Events> transitions)
            throws Exception {
        transitions
            .withExternal()
                .source(States.DRAFT)
                .target(States.SUBMITTED)
                .event(Events.SUBMIT)
                .action(transitionAction())  // Action during transition
                .and()

            .withExternal()
                .source(States.SUBMITTED)
                .target(States.APPROVED)
                .event(Events.APPROVE)
                .action(approvalAction());
    }

    // Action executed when entering SUBMITTED state
    @Bean
    public Action<States, Events> submitAction() {
        return context -> {
            System.out.println("Entering SUBMITTED state");

            // Access message headers (extended state variables)
            String orderId = context.getMessageHeader("orderId");
            System.out.println("Processing order: " + orderId);

            // Perform business logic
            sendNotificationToAdmin(orderId);
            updateDatabase(orderId, States.SUBMITTED);
        };
    }

    // Action executed when exiting SUBMITTED state
    @Bean
    public Action<States, Events> errorAction() {
        return context -> {
            System.out.println("Exiting SUBMITTED state");
            logStateTransition(context);
        };
    }

    // Action during transition
    @Bean
    public Action<States, Events> transitionAction() {
        return context -> {
            System.out.println("Transitioning from " +
                context.getSource().getId() + " to " +
                context.getTarget().getId());

            // Validate business rules
            validateOrderData(context);
        };
    }

    // Approval action with extended state
    @Bean
    public Action<States, Events> approvalAction() {
        return context -> {
            String approver = context.getMessageHeader("approver");
            Instant timestamp = Instant.now();

            // Store in extended state
            context.getExtendedState().getVariables().put("approvedBy", approver);
            context.getExtendedState().getVariables().put("approvedAt", timestamp);

            System.out.println("Order approved by " + approver + " at " + timestamp);

            // Notify customer
            sendApprovalEmail(context.getMessageHeader("orderId"));
        };
    }

    private void sendNotificationToAdmin(String orderId) {
        // Send email/SMS notification
    }

    private void updateDatabase(String orderId, States state) {
        // Update order status in database
    }

    private void logStateTransition(StateContext<States, Events> context) {
        // Log transition for audit trail
    }

    private void validateOrderData(StateContext<States, Events> context) {
        // Validate order data
    }

    private void sendApprovalEmail(String orderId) {
        // Send approval confirmation
    }
}
```

## Guards

Guards protect transitions by checking conditions before allowing them.

```java
@Configuration
@EnableStateMachine
public class GuardStateMachineConfig
        extends EnumStateMachineConfigurerAdapter<States, Events> {

    @Override
    public void configure(StateMachineTransitionConfigurer<States, Events> transitions)
            throws Exception {
        transitions
            // Only submit if order is valid
            .withExternal()
                .source(States.DRAFT)
                .target(States.SUBMITTED)
                .event(Events.SUBMIT)
                .guard(orderValidGuard())
                .and()

            // Only approve if payment received
            .withExternal()
                .source(States.SUBMITTED)
                .target(States.APPROVED)
                .event(Events.APPROVE)
                .guard(paymentReceivedGuard())
                .and()

            // Only complete if items in stock
            .withExternal()
                .source(States.APPROVED)
                .target(States.COMPLETED)
                .event(Events.COMPLETE)
                .guard(inventoryAvailableGuard());
    }

    @Bean
    public Guard<States, Events> orderValidGuard() {
        return context -> {
            // Get order from message headers
            String orderId = context.getMessageHeader("orderId");

            // Validate order
            boolean hasItems = checkOrderHasItems(orderId);
            boolean hasCustomer = checkOrderHasCustomer(orderId);
            boolean hasAddress = checkOrderHasShippingAddress(orderId);

            boolean isValid = hasItems && hasCustomer && hasAddress;

            if (!isValid) {
                System.out.println("Order validation failed for: " + orderId);
            }

            return isValid;
        };
    }

    @Bean
    public Guard<States, Events> paymentReceivedGuard() {
        return context -> {
            String orderId = context.getMessageHeader("orderId");
            BigDecimal orderTotal = getOrderTotal(orderId);
            BigDecimal paymentReceived = getPaymentAmount(orderId);

            boolean isPaid = paymentReceived.compareTo(orderTotal) >= 0;

            if (!isPaid) {
                System.out.println("Payment not received for order: " + orderId);
            }

            return isPaid;
        };
    }

    @Bean
    public Guard<States, Events> inventoryAvailableGuard() {
        return context -> {
            String orderId = context.getMessageHeader("orderId");
            List<OrderItem> items = getOrderItems(orderId);

            // Check inventory for each item
            boolean allAvailable = items.stream()
                .allMatch(item -> checkInventory(item.getSku(), item.getQuantity()));

            if (!allAvailable) {
                System.out.println("Inventory not available for order: " + orderId);

                // Store reason in extended state
                context.getExtendedState().getVariables()
                    .put("failureReason", "Insufficient inventory");
            }

            return allAvailable;
        };
    }

    // SpEL-based guard
    @Override
    public void configure(StateMachineTransitionConfigurer<States, Events> transitions)
            throws Exception {
        transitions
            .withExternal()
                .source(States.DRAFT)
                .target(States.SUBMITTED)
                .event(Events.SUBMIT)
                .guardExpression("headers['orderTotal'] > 0");  // SpEL expression
    }

    // Helper methods
    private boolean checkOrderHasItems(String orderId) {
        // Check database
        return true;
    }

    private boolean checkOrderHasCustomer(String orderId) {
        return true;
    }

    private boolean checkOrderHasShippingAddress(String orderId) {
        return true;
    }

    private BigDecimal getOrderTotal(String orderId) {
        return BigDecimal.valueOf(100);
    }

    private BigDecimal getPaymentAmount(String orderId) {
        return BigDecimal.valueOf(100);
    }

    private List<OrderItem> getOrderItems(String orderId) {
        return new ArrayList<>();
    }

    private boolean checkInventory(String sku, int quantity) {
        return true;
    }
}
```

## Extended State (Context Variables)

Extended state allows storing arbitrary data with the state machine.

```java
@Service
public class OrderStateMachineService {

    @Autowired
    private StateMachine<States, Events> stateMachine;

    public void processOrderWithContext(String orderId, OrderData orderData) {
        stateMachine.start();

        // Create message with headers (context)
        Message<Events> message = MessageBuilder
            .withPayload(Events.SUBMIT)
            .setHeader("orderId", orderId)
            .setHeader("orderTotal", orderData.getTotal())
            .setHeader("customerId", orderData.getCustomerId())
            .setHeader("items", orderData.getItems())
            .build();

        // Send event with context
        stateMachine.sendEvent(message);

        // Access extended state
        Map<Object, Object> variables = stateMachine.getExtendedState().getVariables();

        // Store additional data
        variables.put("processedAt", Instant.now());
        variables.put("processor", "OrderService");

        // Retrieve data
        String approvedBy = (String) variables.get("approvedBy");
        Instant approvedAt = (Instant) variables.get("approvedAt");

        System.out.println("Order " + orderId + " approved by " +
            approvedBy + " at " + approvedAt);
    }
}
```

## Listeners

Listen to state machine events for logging, monitoring, or triggering side effects.

```java
@Component
public class OrderStateMachineListener
        implements StateMachineListener<States, Events> {

    @Override
    public void stateChanged(State<States, Events> from, State<States, Events> to) {
        if (from != null) {
            System.out.println("State changed from " + from.getId() + " to " + to.getId());
        } else {
            System.out.println("State machine started in state: " + to.getId());
        }

        // Log to database
        logStateChange(from, to);

        // Trigger side effects
        if (to.getId() == States.COMPLETED) {
            sendCompletionNotification();
        }
    }

    @Override
    public void stateEntered(State<States, Events> state) {
        System.out.println("Entered state: " + state.getId());

        // Update metrics
        updateMetrics(state.getId());
    }

    @Override
    public void stateExited(State<States, Events> state) {
        System.out.println("Exited state: " + state.getId());
    }

    @Override
    public void eventNotAccepted(Message<Events> event) {
        System.err.println("Event not accepted: " + event.getPayload());

        // Log invalid transition attempt
        logInvalidTransition(event);
    }

    @Override
    public void transition(Transition<States, Events> transition) {
        System.out.println("Transition triggered: " + transition);
    }

    @Override
    public void transitionStarted(Transition<States, Events> transition) {
        System.out.println("Transition started: " + transition.getSource().getId() +
            " -> " + transition.getTarget().getId());
    }

    @Override
    public void transitionEnded(Transition<States, Events> transition) {
        System.out.println("Transition ended");
    }

    @Override
    public void stateMachineStarted(StateMachine<States, Events> stateMachine) {
        System.out.println("State machine started");
    }

    @Override
    public void stateMachineStopped(StateMachine<States, Events> stateMachine) {
        System.out.println("State machine stopped");

        // Cleanup resources
        cleanup();
    }

    @Override
    public void stateMachineError(StateMachine<States, Events> stateMachine, Exception exception) {
        System.err.println("State machine error: " + exception.getMessage());

        // Alert monitoring system
        alertOps(exception);
    }

    private void logStateChange(State<States, Events> from, State<States, Events> to) {
        // Log to database for audit trail
    }

    private void sendCompletionNotification() {
        // Send notification when order completed
    }

    private void updateMetrics(States state) {
        // Update Micrometer metrics
    }

    private void logInvalidTransition(Message<Events> event) {
        // Log to error tracking system
    }

    private void cleanup() {
        // Release resources
    }

    private void alertOps(Exception exception) {
        // Send alert to ops team
    }
}

// Register listener
@Configuration
public class StateMachineListenerConfig {

    @Bean
    public StateMachineListener<States, Events> orderStateMachineListener() {
        return new OrderStateMachineListener();
    }
}
```

## Hierarchical States

Hierarchical states allow nesting states within parent states.

```java
public enum HierarchicalStates {
    // Top-level states
    PROCESSING,
    COMPLETED,

    // Sub-states of PROCESSING
    PROCESSING_VALIDATION,
    PROCESSING_PAYMENT,
    PROCESSING_FULFILLMENT,
    PROCESSING_SHIPPING
}

@Configuration
@EnableStateMachine
public class HierarchicalStateMachineConfig
        extends EnumStateMachineConfigurerAdapter<HierarchicalStates, Events> {

    @Override
    public void configure(StateMachineStateConfigurer<HierarchicalStates, Events> states)
            throws Exception {
        states
            .withStates()
                .initial(HierarchicalStates.PROCESSING)
                .state(HierarchicalStates.PROCESSING)
                .end(HierarchicalStates.COMPLETED)
                .and()

            // Define sub-states under PROCESSING
            .withStates()
                .parent(HierarchicalStates.PROCESSING)
                .initial(HierarchicalStates.PROCESSING_VALIDATION)
                .state(HierarchicalStates.PROCESSING_PAYMENT)
                .state(HierarchicalStates.PROCESSING_FULFILLMENT)
                .state(HierarchicalStates.PROCESSING_SHIPPING);
    }

    @Override
    public void configure(StateMachineTransitionConfigurer<HierarchicalStates, Events> transitions)
            throws Exception {
        transitions
            // Transitions within PROCESSING
            .withExternal()
                .source(HierarchicalStates.PROCESSING_VALIDATION)
                .target(HierarchicalStates.PROCESSING_PAYMENT)
                .event(Events.VALIDATE)
                .and()

            .withExternal()
                .source(HierarchicalStates.PROCESSING_PAYMENT)
                .target(HierarchicalStates.PROCESSING_FULFILLMENT)
                .event(Events.PAY)
                .and()

            .withExternal()
                .source(HierarchicalStates.PROCESSING_FULFILLMENT)
                .target(HierarchicalStates.PROCESSING_SHIPPING)
                .event(Events.FULFILL)
                .and()

            // Transition from PROCESSING to COMPLETED
            .withExternal()
                .source(HierarchicalStates.PROCESSING_SHIPPING)
                .target(HierarchicalStates.COMPLETED)
                .event(Events.SHIP);
    }
}
```

## State Machine Factory

Create multiple state machine instances for different entities.

```java
@Configuration
@EnableStateMachineFactory
public class OrderStateMachineFactoryConfig
        extends EnumStateMachineConfigurerAdapter<States, Events> {

    // Same configuration as before
    @Override
    public void configure(StateMachineStateConfigurer<States, Events> states)
            throws Exception {
        states
            .withStates()
                .initial(States.DRAFT)
                .state(States.SUBMITTED)
                .state(States.APPROVED)
                .end(States.COMPLETED);
    }

    @Override
    public void configure(StateMachineTransitionConfigurer<States, Events> transitions)
            throws Exception {
        transitions
            .withExternal()
                .source(States.DRAFT)
                .target(States.SUBMITTED)
                .event(Events.SUBMIT);
    }
}

@Service
public class OrderStateMachineManager {

    @Autowired
    private StateMachineFactory<States, Events> stateMachineFactory;

    private final Map<String, StateMachine<States, Events>> machines =
        new ConcurrentHashMap<>();

    // Get or create state machine for specific order
    public StateMachine<States, Events> getStateMachine(String orderId) {
        return machines.computeIfAbsent(orderId, id -> {
            StateMachine<States, Events> sm = stateMachineFactory.getStateMachine(id);
            sm.start();
            return sm;
        });
    }

    // Process event for specific order
    public boolean sendEvent(String orderId, Events event) {
        StateMachine<States, Events> sm = getStateMachine(orderId);
        return sm.sendEvent(event);
    }

    // Get current state for order
    public States getCurrentState(String orderId) {
        StateMachine<States, Events> sm = machines.get(orderId);
        if (sm != null) {
            return sm.getState().getId();
        }
        return States.DRAFT;
    }

    // Cleanup state machine when order is complete
    public void releaseStateMachine(String orderId) {
        StateMachine<States, Events> sm = machines.remove(orderId);
        if (sm != null) {
            sm.stop();
        }
    }
}
```

## Persisting State Machine

Persist state machine state to survive application restarts.

```java
// Entity to store state
@Entity
@Table(name = "state_machine_context")
public class StateMachineContext {

    @Id
    private String machineId;

    @Column(length = 50)
    private String state;

    @Column(columnDefinition = "TEXT")
    private String extendedState;

    @Column
    private LocalDateTime updatedAt;

    // Getters and setters
}

// Repository
@Repository
public interface StateMachineContextRepository
        extends JpaRepository<StateMachineContext, String> {
}

// Persister
@Component
public class JpaStateMachinePersister
        implements StateMachinePersist<States, Events, String> {

    @Autowired
    private StateMachineContextRepository repository;

    @Autowired
    private ObjectMapper objectMapper;

    @Override
    public void write(StateMachineContext<States, Events> context, String contextObj)
            throws Exception {

        StateMachineContext entity = new StateMachineContext();
        entity.setMachineId(contextObj);
        entity.setState(context.getState().toString());

        // Serialize extended state
        String extendedStateJson = objectMapper.writeValueAsString(
            context.getExtendedState().getVariables()
        );
        entity.setExtendedState(extendedStateJson);
        entity.setUpdatedAt(LocalDateTime.now());

        repository.save(entity);
    }

    @Override
    public StateMachineContext<States, Events> read(String contextObj) throws Exception {
        Optional<StateMachineContext> optional = repository.findById(contextObj);

        if (optional.isPresent()) {
            StateMachineContext entity = optional.get();

            // Deserialize extended state
            @SuppressWarnings("unchecked")
            Map<Object, Object> variables = objectMapper.readValue(
                entity.getExtendedState(),
                Map.class
            );

            return new DefaultStateMachineContext<>(
                States.valueOf(entity.getState()),
                null,
                null,
                new DefaultExtendedState(variables)
            );
        }

        return null;
    }
}

// Service using persister
@Service
public class PersistentOrderService {

    @Autowired
    private StateMachineFactory<States, Events> factory;

    @Autowired
    private StateMachinePersister<States, Events, String> persister;

    public void processOrder(String orderId, Events event) {
        // Get state machine
        StateMachine<States, Events> sm = factory.getStateMachine(orderId);

        try {
            // Restore previous state if exists
            persister.restore(sm, orderId);

            // Send event
            sm.sendEvent(event);

            // Persist new state
            persister.persist(sm, orderId);

        } catch (Exception e) {
            throw new RuntimeException("Failed to process order", e);
        }
    }

    public States getOrderState(String orderId) {
        StateMachine<States, Events> sm = factory.getStateMachine(orderId);

        try {
            persister.restore(sm, orderId);
            return sm.getState().getId();
        } catch (Exception e) {
            return States.DRAFT;  // Default state
        }
    }
}
```

## Real-World Example: E-Commerce Order Processing

Complete production-ready example with all features.

```java
// States
public enum OrderStates {
    CART,           // Shopping cart
    PENDING,        // Order placed
    PAYMENT_PENDING,
    PAID,
    PROCESSING,
    SHIPPED,
    DELIVERED,
    CANCELLED,
    REFUNDED
}

// Events
public enum OrderEvents {
    PLACE_ORDER,
    PROCESS_PAYMENT,
    PAYMENT_FAILED,
    CONFIRM_PAYMENT,
    START_PROCESSING,
    SHIP,
    DELIVER,
    CANCEL,
    REFUND
}

// Configuration
@Configuration
@EnableStateMachineFactory
@Slf4j
public class OrderStateMachineConfig
        extends EnumStateMachineConfigurerAdapter<OrderStates, OrderEvents> {

    @Autowired
    private OrderService orderService;

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private NotificationService notificationService;

    @Override
    public void configure(StateMachineStateConfigurer<OrderStates, OrderEvents> states)
            throws Exception {
        states
            .withStates()
                .initial(OrderStates.CART)
                .state(OrderStates.PENDING)
                .state(OrderStates.PAYMENT_PENDING)
                .state(OrderStates.PAID)
                .state(OrderStates.PROCESSING)
                .state(OrderStates.SHIPPED)
                .end(OrderStates.DELIVERED)
                .end(OrderStates.CANCELLED)
                .end(OrderStates.REFUNDED);
    }

    @Override
    public void configure(StateMachineTransitionConfigurer<OrderStates, OrderEvents> transitions)
            throws Exception {
        transitions
            // CART -> PENDING
            .withExternal()
                .source(OrderStates.CART)
                .target(OrderStates.PENDING)
                .event(OrderEvents.PLACE_ORDER)
                .guard(cartNotEmptyGuard())
                .action(placeOrderAction())
                .and()

            // PENDING -> PAYMENT_PENDING
            .withExternal()
                .source(OrderStates.PENDING)
                .target(OrderStates.PAYMENT_PENDING)
                .event(OrderEvents.PROCESS_PAYMENT)
                .action(initiatePaymentAction())
                .and()

            // PAYMENT_PENDING -> PAID
            .withExternal()
                .source(OrderStates.PAYMENT_PENDING)
                .target(OrderStates.PAID)
                .event(OrderEvents.CONFIRM_PAYMENT)
                .guard(paymentSuccessfulGuard())
                .action(confirmPaymentAction())
                .and()

            // PAYMENT_PENDING -> CANCELLED (payment failed)
            .withExternal()
                .source(OrderStates.PAYMENT_PENDING)
                .target(OrderStates.CANCELLED)
                .event(OrderEvents.PAYMENT_FAILED)
                .action(cancelOrderAction())
                .and()

            // PAID -> PROCESSING
            .withExternal()
                .source(OrderStates.PAID)
                .target(OrderStates.PROCESSING)
                .event(OrderEvents.START_PROCESSING)
                .guard(inventoryAvailableGuard())
                .action(startProcessingAction())
                .and()

            // PROCESSING -> SHIPPED
            .withExternal()
                .source(OrderStates.PROCESSING)
                .target(OrderStates.SHIPPED)
                .event(OrderEvents.SHIP)
                .action(shipOrderAction())
                .and()

            // SHIPPED -> DELIVERED
            .withExternal()
                .source(OrderStates.SHIPPED)
                .target(OrderStates.DELIVERED)
                .event(OrderEvents.DELIVER)
                .action(deliverOrderAction())
                .and()

            // Allow cancellation from certain states
            .withExternal()
                .source(OrderStates.PENDING)
                .target(OrderStates.CANCELLED)
                .event(OrderEvents.CANCEL)
                .action(cancelOrderAction())
                .and()

            .withExternal()
                .source(OrderStates.PAYMENT_PENDING)
                .target(OrderStates.CANCELLED)
                .event(OrderEvents.CANCEL)
                .action(cancelOrderAction())
                .and()

            // Refund from PAID or PROCESSING
            .withExternal()
                .source(OrderStates.PAID)
                .target(OrderStates.REFUNDED)
                .event(OrderEvents.REFUND)
                .guard(refundEligibleGuard())
                .action(processRefundAction())
                .and()

            .withExternal()
                .source(OrderStates.PROCESSING)
                .target(OrderStates.REFUNDED)
                .event(OrderEvents.REFUND)
                .guard(refundEligibleGuard())
                .action(processRefundAction());
    }

    // Guards
    @Bean
    public Guard<OrderStates, OrderEvents> cartNotEmptyGuard() {
        return context -> {
            String orderId = context.getMessageHeader("orderId");
            return orderService.hasItems(orderId);
        };
    }

    @Bean
    public Guard<OrderStates, OrderEvents> paymentSuccessfulGuard() {
        return context -> {
            String paymentId = context.getMessageHeader("paymentId");
            return paymentService.isPaymentSuccessful(paymentId);
        };
    }

    @Bean
    public Guard<OrderStates, OrderEvents> inventoryAvailableGuard() {
        return context -> {
            String orderId = context.getMessageHeader("orderId");
            return orderService.checkInventory(orderId);
        };
    }

    @Bean
    public Guard<OrderStates, OrderEvents> refundEligibleGuard() {
        return context -> {
            String orderId = context.getMessageHeader("orderId");
            return orderService.isRefundEligible(orderId);
        };
    }

    // Actions
    @Bean
    public Action<OrderStates, OrderEvents> placeOrderAction() {
        return context -> {
            String orderId = context.getMessageHeader("orderId");
            String customerId = context.getMessageHeader("customerId");

            log.info("Placing order {} for customer {}", orderId, customerId);

            orderService.createOrder(orderId, customerId);
            notificationService.sendOrderConfirmation(orderId);

            context.getExtendedState().getVariables()
                .put("placedAt", Instant.now());
        };
    }

    @Bean
    public Action<OrderStates, OrderEvents> initiatePaymentAction() {
        return context -> {
            String orderId = context.getMessageHeader("orderId");
            BigDecimal amount = context.getMessageHeader("amount");

            log.info("Initiating payment for order {} - Amount: {}", orderId, amount);

            String paymentId = paymentService.initiatePayment(orderId, amount);

            context.getExtendedState().getVariables()
                .put("paymentId", paymentId);
        };
    }

    @Bean
    public Action<OrderStates, OrderEvents> confirmPaymentAction() {
        return context -> {
            String orderId = context.getMessageHeader("orderId");
            String paymentId = (String) context.getExtendedState()
                .getVariables().get("paymentId");

            log.info("Payment confirmed for order {}", orderId);

            orderService.updatePaymentStatus(orderId, "PAID");
            notificationService.sendPaymentConfirmation(orderId);

            context.getExtendedState().getVariables()
                .put("paidAt", Instant.now());
        };
    }

    @Bean
    public Action<OrderStates, OrderEvents> startProcessingAction() {
        return context -> {
            String orderId = context.getMessageHeader("orderId");

            log.info("Starting to process order {}", orderId);

            orderService.reserveInventory(orderId);
            orderService.assignToWarehouse(orderId);

            context.getExtendedState().getVariables()
                .put("processingStartedAt", Instant.now());
        };
    }

    @Bean
    public Action<OrderStates, OrderEvents> shipOrderAction() {
        return context -> {
            String orderId = context.getMessageHeader("orderId");

            log.info("Shipping order {}", orderId);

            String trackingNumber = orderService.generateShippingLabel(orderId);
            orderService.updateShippingStatus(orderId, trackingNumber);
            notificationService.sendShippingNotification(orderId, trackingNumber);

            context.getExtendedState().getVariables()
                .put("trackingNumber", trackingNumber);
            context.getExtendedState().getVariables()
                .put("shippedAt", Instant.now());
        };
    }

    @Bean
    public Action<OrderStates, OrderEvents> deliverOrderAction() {
        return context -> {
            String orderId = context.getMessageHeader("orderId");

            log.info("Order {} delivered", orderId);

            orderService.markAsDelivered(orderId);
            notificationService.sendDeliveryConfirmation(orderId);

            context.getExtendedState().getVariables()
                .put("deliveredAt", Instant.now());
        };
    }

    @Bean
    public Action<OrderStates, OrderEvents> cancelOrderAction() {
        return context -> {
            String orderId = context.getMessageHeader("orderId");
            String reason = context.getMessageHeader("cancellationReason");

            log.info("Cancelling order {} - Reason: {}", orderId, reason);

            orderService.cancelOrder(orderId, reason);

            // Release inventory if reserved
            if (context.getExtendedState().getVariables()
                    .containsKey("inventoryReserved")) {
                orderService.releaseInventory(orderId);
            }

            notificationService.sendCancellationNotification(orderId);
        };
    }

    @Bean
    public Action<OrderStates, OrderEvents> processRefundAction() {
        return context -> {
            String orderId = context.getMessageHeader("orderId");
            String paymentId = (String) context.getExtendedState()
                .getVariables().get("paymentId");

            log.info("Processing refund for order {}", orderId);

            paymentService.processRefund(paymentId);
            orderService.releaseInventory(orderId);
            notificationService.sendRefundNotification(orderId);

            context.getExtendedState().getVariables()
                .put("refundedAt", Instant.now());
        };
    }
}

// Listener for monitoring
@Component
@Slf4j
public class OrderStateMachineListener
        implements StateMachineListener<OrderStates, OrderEvents> {

    @Autowired
    private MetricsService metricsService;

    @Autowired
    private AuditService auditService;

    @Override
    public void stateChanged(State<OrderStates, OrderEvents> from,
                           State<OrderStates, OrderEvents> to) {
        log.info("Order state changed: {} -> {}",
            from != null ? from.getId() : "START",
            to.getId());

        // Record metrics
        metricsService.recordStateChange(to.getId());

        // Audit trail
        auditService.logStateChange(from, to);
    }

    @Override
    public void eventNotAccepted(Message<OrderEvents> event) {
        log.warn("Event not accepted: {}", event.getPayload());

        // Alert if important event rejected
        if (event.getPayload() == OrderEvents.PROCESS_PAYMENT) {
            metricsService.incrementPaymentRejections();
        }
    }

    @Override
    public void stateMachineError(StateMachine<OrderStates, OrderEvents> stateMachine,
                                Exception exception) {
        log.error("State machine error", exception);

        // Alert ops team
        metricsService.recordError(exception);
    }
}
```

## Testing State Machines

```java
@SpringBootTest
public class OrderStateMachineTest {

    @Autowired
    private StateMachineFactory<OrderStates, OrderEvents> factory;

    @Test
    public void testHappyPath() {
        // Get state machine
        StateMachine<OrderStates, OrderEvents> sm = factory.getStateMachine("test-order-1");
        sm.start();

        // Verify initial state
        assertThat(sm.getState().getId()).isEqualTo(OrderStates.CART);

        // Place order
        sm.sendEvent(createEvent(OrderEvents.PLACE_ORDER, "test-order-1", "customer-123"));
        assertThat(sm.getState().getId()).isEqualTo(OrderStates.PENDING);

        // Process payment
        sm.sendEvent(createEvent(OrderEvents.PROCESS_PAYMENT, "test-order-1"));
        assertThat(sm.getState().getId()).isEqualTo(OrderStates.PAYMENT_PENDING);

        // Confirm payment
        sm.sendEvent(createEvent(OrderEvents.CONFIRM_PAYMENT, "test-order-1"));
        assertThat(sm.getState().getId()).isEqualTo(OrderStates.PAID);

        // Start processing
        sm.sendEvent(createEvent(OrderEvents.START_PROCESSING, "test-order-1"));
        assertThat(sm.getState().getId()).isEqualTo(OrderStates.PROCESSING);

        // Ship
        sm.sendEvent(createEvent(OrderEvents.SHIP, "test-order-1"));
        assertThat(sm.getState().getId()).isEqualTo(OrderStates.SHIPPED);

        // Deliver
        sm.sendEvent(createEvent(OrderEvents.DELIVER, "test-order-1"));
        assertThat(sm.getState().getId()).isEqualTo(OrderStates.DELIVERED);

        sm.stop();
    }

    @Test
    public void testPaymentFailure() {
        StateMachine<OrderStates, OrderEvents> sm = factory.getStateMachine("test-order-2");
        sm.start();

        // Place order and initiate payment
        sm.sendEvent(createEvent(OrderEvents.PLACE_ORDER, "test-order-2", "customer-456"));
        sm.sendEvent(createEvent(OrderEvents.PROCESS_PAYMENT, "test-order-2"));

        assertThat(sm.getState().getId()).isEqualTo(OrderStates.PAYMENT_PENDING);

        // Payment fails
        sm.sendEvent(createEvent(OrderEvents.PAYMENT_FAILED, "test-order-2"));

        assertThat(sm.getState().getId()).isEqualTo(OrderStates.CANCELLED);

        sm.stop();
    }

    @Test
    public void testCancellation() {
        StateMachine<OrderStates, OrderEvents> sm = factory.getStateMachine("test-order-3");
        sm.start();

        sm.sendEvent(createEvent(OrderEvents.PLACE_ORDER, "test-order-3", "customer-789"));

        // Cancel from PENDING state
        sm.sendEvent(createEvent(OrderEvents.CANCEL, "test-order-3"));

        assertThat(sm.getState().getId()).isEqualTo(OrderStates.CANCELLED);

        sm.stop();
    }

    @Test
    public void testExtendedState() {
        StateMachine<OrderStates, OrderEvents> sm = factory.getStateMachine("test-order-4");
        sm.start();

        sm.sendEvent(createEvent(OrderEvents.PLACE_ORDER, "test-order-4", "customer-999"));

        // Check extended state
        Map<Object, Object> variables = sm.getExtendedState().getVariables();

        assertThat(variables).containsKey("placedAt");
        assertThat(variables.get("placedAt")).isInstanceOf(Instant.class);

        sm.stop();
    }

    private Message<OrderEvents> createEvent(OrderEvents event, String orderId) {
        return MessageBuilder
            .withPayload(event)
            .setHeader("orderId", orderId)
            .build();
    }

    private Message<OrderEvents> createEvent(OrderEvents event, String orderId, String customerId) {
        return MessageBuilder
            .withPayload(event)
            .setHeader("orderId", orderId)
            .setHeader("customerId", customerId)
            .build();
    }
}
```

## Key Takeaways

- **State machines** provide clear, maintainable workflow management
- **Guards** enforce business rules and prevent invalid transitions
- **Actions** execute business logic during transitions
- **Extended state** stores contextual data
- **Listeners** enable monitoring and side effects
- **Persistence** allows state machines to survive restarts
- **Factories** create multiple instances for different entities
- **Hierarchical states** organize complex state structures
- **Testing** is straightforward with Spring's testing support

Spring State Machine is perfect for:
- ✅ Order processing workflows
- ✅ Approval processes
- ✅ Document lifecycle management
- ✅ User onboarding flows
- ✅ IoT device state management
- ✅ Game state management
- ✅ Complex business workflows

Use state machines when you have **clear, finite states** with **well-defined transitions** and **business rules** that govern state changes!
